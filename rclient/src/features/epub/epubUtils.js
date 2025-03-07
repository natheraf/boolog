function countWords(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
  s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
  s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
  return s.split(" ").filter((char) => char !== " ").length;
} // https://stackoverflow.com/a/18679657

export const processEpub = (epubObject) => {
  const contentRef = epubObject["opf"].package;
  const tocRef = epubObject["ncx"].ncx;
  const manifestRef = contentRef.manifest.item;

  const elementMap = new Map();
  for (const item of manifestRef) {
    const path = item["@_href"];
    const type = path.substring(item["@_href"].lastIndexOf("." + 1));
    if (type.indexOf("html") === -1) {
      continue;
    }
    if (!epubObject.html[path]) {
      continue;
    }

    const parser = new DOMParser();
    const page = parser.parseFromString(
      epubObject.html[path],
      type === "html" ? "text/html" : "application/xhtml+xml"
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
        if (node.parentElement.tagName === "DIV") {
          node.style.display = "block";
        }
        node.id = node.getAttribute("src");
        imageIds.push(node.getAttribute("src"));
      } else if (tag === "image") {
        node.style.height = "100%";
        node.style.width = "";
        node.id = node.getAttribute("src");
        imageIds.push(node.getAttribute("src"));
      } else if (tag === "a") {
        node.style.cursor = "pointer";
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
      href: item["@_href"],
      type,
      length: countWords(body.textContent),
    });
  }

  const navMap = new Map(); // content -> nav label / chapter name
  for (const navPoint of tocRef.navMap.navPoint) {
    const src = navPoint.content?.["@_src"];
    navMap.set(
      src?.substring(
        0,
        src?.indexOf("#") === -1 ? undefined : src?.indexOf("#")
      ),
      navPoint.navLabel?.text ?? "error: no chapter name"
    );
  }

  let wordCountAccumulator = 0;
  const chapterMeta = [];
  const spineStack = [];
  const spineMap = {};
  const spineRef = contentRef.spine.itemref;
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

  const metadata = {
    title:
      tocRef.docTitle?.text ??
      contentRef?.metadata?.["dc:title"]?.["#text"] ??
      contentRef?.metadata?.["dc:title"] ??
      "Untitled",
    artist:
      tocRef.docAuthor?.text ??
      contentRef?.metadata?.["dc:creator"]?.["#text"] ??
      contentRef?.metadata?.["dc:creator"] ??
      "No Creator",
  };

  return {
    spine: spineStack,
    spineIndexMap: spineMap,
    css: epubObject.css,
    images: epubObject.images,
    metadata,
    chapterMeta,
  };
};
