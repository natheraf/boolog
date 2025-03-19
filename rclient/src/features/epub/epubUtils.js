import { getRelatorsLabelFromIdentifier } from "../../api/Local";

function countWords(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
  s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
  s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
  return s.split(" ").filter((char) => char !== " ").length;
} // https://stackoverflow.com/a/18679657

export const getEpubValueFromPath = (epubTypeObject, path) => {
  const fileName = path.substring(path.lastIndexOf("/") + 1);
  if (
    epubTypeObject.hasOwnProperty(fileName) &&
    (typeof epubTypeObject[fileName] !== "object" ||
      epubTypeObject[fileName]?.type !== undefined)
  ) {
    return epubTypeObject[fileName] ?? null;
  }
  if (typeof epubTypeObject[fileName] === "object") {
    return (
      epubTypeObject[fileName][
        Object.keys(epubTypeObject[fileName]).find((fullPath) =>
          fullPath.includes(path)
        )
      ] ?? null
    );
  }
  return (
    epubTypeObject[
      Object.keys(epubTypeObject).find((fullPath) => fullPath.includes(path))
    ] ?? null
  );
};

export const processEpub = (epubObject) => {
  const contentRef = epubObject["opf"].package;
  if (contentRef.hasOwnProperty("@_unique-identifier") === false) {
    throw new Error("unique-identifier not found");
  }
  const tocRef = epubObject["ncx"]?.ncx ?? {};
  const manifestRef = contentRef.manifest.item;

  const elementMap = new Map();
  for (const item of manifestRef) {
    const path = item["@_href"].toUpperCase().startsWith("OEBPS/")
      ? item["@_href"].substring(6)
      : item["@_href"];
    const fileName = path.substring(path.lastIndexOf("/") + 1);
    const type = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (["htm", "html", "xhtml"].includes(type) === false) {
      elementMap.set(item["@_id"], {
        href: path,
      });
      if (item.hasOwnProperty("@_properties")) {
        elementMap.set(item["@_properties"], {
          href: path,
        });
      }
      continue;
    }
    if (getEpubValueFromPath(epubObject.html, path) === null) {
      continue;
    }

    const parser = new DOMParser();
    const page = parser.parseFromString(
      getEpubValueFromPath(epubObject.html, path),
      type === "xhtml" ? "application/xhtml+xml" : "text/html"
    );
    const nodes = page.querySelectorAll("img, image, a");
    if (!nodes) {
      continue;
    }
    const imageIds = [];
    for (const node of nodes) {
      const tag = node.tagName.toLowerCase();
      if (tag === "img") {
        const src = node.getAttribute("src");
        if (!src) {
          continue;
        }
        node.style.objectFit = "scale-down";
        node.style.margin = "auto";
        node.id = node.getAttribute("src");
        node.setAttribute("ogsrc", node.getAttribute("src"));
        imageIds.push(node.getAttribute("src"));
      } else if (tag === "image") {
        node.style.height = "100%";
        node.style.width = "";
        node.getAttribute("src") &&
          node.setAttribute("ogsrc", node.getAttribute("src"));
        node.getAttribute("href") &&
          node.setAttribute("oghref", node.getAttribute("href"));
        node.id =
          node.getAttribute("src") ||
          node.getAttribute("href") ||
          node.getAttribute("xlink:href");
        imageIds.push(node.id);
      } else if (tag === "a") {
        node.setAttribute("linkto", node.getAttribute("href"));
        node.removeAttribute("href");
      }
    }
    const body = page.querySelector("body") ?? page.querySelector("section");
    const pageContent = document.createElement("div");
    pageContent.id = "inner-content";
    pageContent.innerHTML = body.innerHTML;
    const element = pageContent.outerHTML;

    if (item.hasOwnProperty("@_properties")) {
      elementMap.set(item["@_properties"], element);
    }
    elementMap.set(item["@_id"], {
      section: element,
      href: path,
      type,
      length: countWords(body.textContent),
    });
  }

  const navMap = new Map(); // content -> nav label / chapter name
  const toc = [];
  const navPoints =
    tocRef.navMap?.navPoint?.sort(
      (a, b) => (a.playOrder ?? 0) - (b.playOrder ?? 0)
    ) ?? [];
  for (const navPoint of navPoints) {
    const src = navPoint.content?.["@_src"].toUpperCase().startsWith("OEBPS/")
      ? navPoint.content?.["@_src"].substring(6)
      : navPoint.content?.["@_src"];
    navMap.set(
      src?.substring(
        0,
        src?.indexOf("#") === -1 ? undefined : src?.indexOf("#")
      ),
      navPoint.navLabel?.text ?? "error: no chapter name"
    );
    toc.push({
      src,
      label: navPoint.navLabel?.text ?? "error: no chapter name",
      playOrder: navPoint["@_playOrder"] ?? null,
    });
  }
  if (toc[0]?.playOrder !== null) {
    toc.sort((a, b) => a.playOrder - b.playOrder);
  }

  let wordCountAccumulator = 0;
  const chapterMeta = [];
  const spineStack = [];
  const spineMap = {};
  let spineRef = contentRef?.spine?.itemref ?? [];
  if (typeof spineRef === "object" && Array.isArray(spineRef) === false) {
    spineRef = [spineRef];
  }
  for (const item of spineRef) {
    spineMap[elementMap.get(item["@_idref"]).href] = spineStack.length;
    spineStack.push({
      element: elementMap.get(item["@_idref"]).section,
      label:
        navMap.get(elementMap.get(item["@_idref"]).href) ??
        spineStack[spineStack.length - 1]?.label ??
        "No Chapter",
      type: elementMap.get(item["@_idref"])?.type,
      wordCount: elementMap.get(item["@_idref"])?.length,
      onGoingWordCount: wordCountAccumulator,
    });
    if (
      chapterMeta[chapterMeta.length - 1]?.label !==
      spineStack[spineStack.length - 1]?.label
    ) {
      chapterMeta.push({
        label: spineStack[spineStack.length - 1]?.label,
        wordCount: 0,
        onGoingWordCount: wordCountAccumulator,
        spineStartIndex: spineStack.length - 1,
        lengthInSpine: 0,
      });
    }
    chapterMeta[chapterMeta.length - 1].wordCount +=
      elementMap.get(item["@_idref"])?.length ?? 0;
    chapterMeta[chapterMeta.length - 1].lengthInSpine += 1;
    wordCountAccumulator += elementMap.get(item["@_idref"])?.length;
    spineStack[spineStack.length - 1].chapterMetaIndex = chapterMeta.length - 1;
  }

  let chapterIndex = 0;
  for (let index = 0; index < spineStack.length; index += 1) {
    if (
      index >=
      chapterMeta[chapterIndex].lengthInSpine +
        chapterMeta[chapterIndex].spineStartIndex
    ) {
      chapterIndex += 1;
    }
    const content = spineStack[index];
    content.frontCount =
      chapterMeta[chapterIndex].lengthInSpine +
      chapterMeta[chapterIndex].spineStartIndex -
      index -
      1;
    content.backCount = index - chapterMeta[chapterIndex].spineStartIndex;
  }

  const end = document.createElement("div");
  end.id = "inner-content";
  end.innerHTML = "<h1>Fin</h1>";
  spineStack.push({
    element: end.outerHTML,
    label: "End",
    onGoingWordCount: wordCountAccumulator,
  });

  const forceValueAsArray = (obj, key) => {
    return Array.isArray(obj[key]) === false ? [obj[key]] : obj[key];
  };
  const metadata = {};
  const contentMeta = contentRef?.metadata ?? {};
  contentMeta.meta = forceValueAsArray(contentMeta, "meta");
  const parseMetaIntoObject = (value) => {
    const res = {};
    if (typeof value === "object" && Array.isArray(value)) {
      for (const element of value) {
        if (typeof element === "object" && element.hasOwnProperty("@_id")) {
          res[element["@_id"]] = parseMetaIntoObject(element);
        } else {
          if (res.hasOwnProperty("noId") === false) {
            res.noId = [];
          }
          res.noId.push(element);
        }
      }
    } else {
      const relevantMetaObjects =
        typeof value === "object" && value["@_id"] !== undefined
          ? contentMeta.meta?.filter((obj) =>
              obj["@_refines"]?.endsWith(value["@_id"])
            )
          : [];
      res.value = value["#text"] ?? value;
      for (const obj of relevantMetaObjects) {
        res[obj["@_property"]] = obj["#text"];
      }
    }
    return res;
  };
  for (const rawKey of Object.keys(contentMeta)) {
    if (rawKey.startsWith("dc:") === false) {
      continue;
    }
    const key = rawKey.substring(rawKey.indexOf(":") + 1);
    metadata[key] = parseMetaIntoObject(contentMeta[rawKey]);
  }

  const otherMetaObjects =
    contentMeta.meta?.filter(
      (obj) => obj.hasOwnProperty("@_refines") === false
    ) ?? [];
  for (const obj of otherMetaObjects) {
    if (obj.hasOwnProperty("@_property")) {
      metadata[obj["@_property"]] = parseMetaIntoObject(obj);
    } else {
      metadata[obj["@_name"]] = obj["@_content"];
    }
  }

  metadata.ncx = {
    title: tocRef.docTitle?.text,
    author: tocRef.docAuthor?.text,
  };
  const ncxHeadMeta = !tocRef?.head?.meta
    ? []
    : forceValueAsArray(tocRef.head, "meta");
  for (const obj of ncxHeadMeta) {
    const key = obj["@_name"].substring(obj["@_name"].indexOf(":") + 1);
    metadata.ncx[key] = obj["@_content"];
  }
  metadata.common = {
    title: { value: metadata.ncx.title ?? metadata.title?.value ?? "Untitled" },
    author: { value: tocRef.docAuthor?.text },
    words: { value: wordCountAccumulator },
    cover: {
      value:
        elementMap.get("cover-image")?.href ??
        elementMap.get(metadata.cover)?.href ??
        null,
    },
    uId: {
      value:
        metadata.identifier?.value ??
        metadata.identifier?.[contentRef["@_unique-identifier"]].value ??
        metadata.identifier?.noId?.[0] ??
        null,
    },
    authors: { value: [] },
  };
  if (
    metadata.common.uId.value === null ||
    typeof metadata.common.uId.value === "object"
  ) {
    throw new Error("unable to find uId");
  }
  const addAllCreators = (obj) => {
    if (obj.hasOwnProperty("value") && obj.hasOwnProperty("role")) {
      metadata.common.authors.value[(obj["display-seq"] ?? 1) - 1] = obj.value;
      metadata.common[getRelatorsLabelFromIdentifier(obj.role)] = obj;
    }
    for (const value of Object.values(obj)) {
      if (typeof value === "object") {
        addAllCreators(value);
      }
    }
  };
  addAllCreators(metadata.creator);
  metadata.common.authors.value = metadata.common.authors.value.filter(
    (value) => value !== undefined
  );

  return {
    spine: spineStack,
    spineIndexMap: spineMap,
    css: epubObject.css,
    images: epubObject.images,
    metadata,
    chapterMeta,
    toc,
  };
};
