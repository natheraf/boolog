import * as React from "react";
import { convertFileToBlob } from "../files/fileUtils";

const parseCSSText = (cssText) => {
  const cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ");
  const style = {},
    [, ruleName, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
  const cssToJs = (s) =>
    s.replace(/\W+\w/g, (match) => match.slice(-1).toUpperCase());
  const properties = rule
    .split(";")
    .map((o) => o.split(":").map((x) => x && x.trim()));
  for (const [property, value] of properties) style[cssToJs(property)] = value;
  return { cssText, ruleName, style };
}; // https://stackoverflow.com/a/43012849

onmessage = async (epubObject) => {
  const contentRef = epubObject["opf"].package;
  const manifestRef = contentRef.manifest.item;
  const structureRef = epubObject["OEBPS"];
  const tocRef = epubObject["ncx"].ncx;

  const createReactDOM = async (htmlElement) => {
    if (htmlElement === null) {
      return null;
    }
    if (htmlElement.nodeName === "#text") {
      return htmlElement.data;
    }
    const tag = htmlElement.tagName.toLowerCase();
    if (tag === "br") {
      return React.createElement("br");
    }
    const props = {};
    for (const attribute of htmlElement.attributes) {
      if (attribute.name === "style") {
        props.style = parseCSSText(attribute.value).style;
      } else if (attribute.name === "class") {
        props.className = attribute.value;
      } else if (attribute.name !== "href") {
        props[attribute.name] = attribute.value;
      }
    }
    if (tag === "image") {
      let src = null;
      for (const key of ["xlink:href", "href"]) {
        if (htmlElement.getAttribute(key) !== null) {
          src = htmlElement.getAttribute(key);
        }
      }
      if (src !== null) {
        const path = src
          .substring(src.indexOf("..") === -1 ? 0 : src.indexOf("/") + 1)
          .split("/");
        const fileName = path.pop();
        let it = structureRef;
        for (const node of path) {
          it = it[node];
        }
        const imgFile = it[fileName];
        const blob = await convertFileToBlob(imgFile);
        props["href"] = URL.createObjectURL(blob);
        props["height"] = "100%";
        delete props.width;
      }
    } else if (tag === "img") {
      const src = htmlElement.getAttribute("src");
      const path = src
        .substring(src.indexOf("..") === -1 ? 0 : src.indexOf("/") + 1)
        .split("/");
      const fileName = path.pop();
      let it = structureRef;
      for (const node of path) {
        it = it[node];
      }
      const imgFile = it[fileName];
      const blob = await convertFileToBlob(imgFile);
      props.src = URL.createObjectURL(blob);
      props.style = {
        objectFit: "scale-down",
        margin: "auto",
      };
    } else if (tag === "a" && htmlElement.getAttribute("href") !== null) {
      props.style = { color: "lightblue", cursor: "pointer" };
      props.linkto = htmlElement.getAttribute("href");
    }

    const reactChildren = [];
    for (const child of htmlElement.childNodes) {
      reactChildren.push(await createReactDOM(child));
    }

    return React.createElement(tag, props, ...reactChildren);
  };

  const elementMap = new Map();
  for (const item of manifestRef) {
    const path = item["@_href"].split("/");
    let it = structureRef;
    for (const node of path) {
      it = it[node];
    }
    if (it.type === "css") {
      const styleElement = document.createElement("style");
      styleElement.id = `epub-css-${it.name}`;
      styleElement.innerHTML = `#content, #previous-content {\n${it.text}\n}`;
      document.head.insertAdjacentElement("beforeend", styleElement);
      continue;
    }
    if (it.hasOwnProperty("filename")) {
      continue;
    }

    const page = document.createElement("html");
    page.innerHTML = it.text;
    const body = page.querySelector("body") ?? page.querySelector("section");
    const pageContent = document.createElement("div");
    pageContent.id = "inner-content";
    pageContent.innerHTML = body.innerHTML;
    const reactNode = await createReactDOM(pageContent);

    if (item.hasOwnProperty("@_properties")) {
      elementMap.set(item["@_properties"], reactNode);
    }
    elementMap.set(item["@_id"], {
      section: reactNode,
      href: item["@_href"],
    });
  }

  const navMap = new Map(); // content -> nav label / chapter name
  for (const navPoint of tocRef.navMap.navPoint) {
    navMap.set(
      navPoint.content?.["@_src"],
      navPoint.navLabel?.text ?? "error: no label"
    );
  }

  const spineStack = [];
  const spineMap = new Map();
  const spineRef = contentRef.spine.itemref;
  for (const item of spineRef) {
    spineMap.set(elementMap.get(item["@_idref"]).href, spineStack.length);
    spineStack.push({
      element: elementMap.get(item["@_idref"]).section,
      label:
        navMap.get(elementMap.get(item["@_idref"]).href) ??
        spineStack[spineStack.length - 1].label ??
        "No Chapter",
    });
  }

  return { spineMap, spineStack };
};
