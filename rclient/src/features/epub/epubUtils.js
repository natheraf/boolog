import { getRelatorsLabelFromIdentifier } from "../../api/Local";
import { handleSearchOnDocument } from "./domUtils";

export const loadImages = (epubObject, spineIndex, imageObjectURLs) => {
  const pageHeight = window.innerHeight;
  const spine = epubObject.spine;
  const images = epubObject.images;
  const parser = new DOMParser();
  const page = parser.parseFromString(spine[spineIndex].element, "text/html");
  const imageElements = page.querySelectorAll("img, image");
  for (const element of imageElements) {
    const tag = element.tagName.toLowerCase();
    let url;
    if (tag === "img") {
      const src = element
        .getAttribute("ogsrc")
        ?.substring(element.getAttribute("ogsrc").startsWith("../") * 3);
      url =
        imageObjectURLs.get(src) ??
        URL.createObjectURL(getEpubValueFromPath(images, src));
      element.src = url;
      imageObjectURLs.set(src, url);
      if (["DIV", "SECTION"].includes(element.parentElement.tagName)) {
        element.style.display = "block";
      }
      element.style.objectFit = "scale-down";
      element.style.margin = "auto";
      element.style.maxHeight = `${pageHeight}px`;
      element.style.maxWidth = "100%";
    } else if (tag === "image") {
      let src = null;
      for (const key of ["xlink:href", "oghref", "ogsrc"]) {
        if (element.getAttribute(key) !== null) {
          src = element.getAttribute(key);
        }
      }
      src = src?.substring(src.startsWith("../") * 3);
      url =
        imageObjectURLs.get(src) ??
        URL.createObjectURL(getEpubValueFromPath(images, src));
      imageObjectURLs.set(src, url);
      element.setAttribute("href", url);
      element.style.height = "100%";
      element.style.width = "";
    }
  }
  spine[spineIndex].element = page.documentElement.outerHTML;
};

export const handleSearchEpub = (needle, spine) => {
  const results = [];
  const parser = new DOMParser();
  let previousChapterLabel = null;
  for (let index = 0; index < spine.length; index += 1) {
    const chapter = spine[index];
    if (chapter.label !== previousChapterLabel) {
      results.push({
        label: chapter.label,
        searchResults: [],
      });
      previousChapterLabel = chapter.label;
    }
    const doc = parser.parseFromString(chapter.element, "text/html");
    const chapterResults = handleSearchOnDocument(needle, doc);
    if (chapterResults.length > 0) {
      chapterResults.forEach((result) => (result.spineIndex = index));
      results[results.length - 1].searchResults.push(...chapterResults);
    }
  }
  return results.filter(
    (chapterResults) => chapterResults.searchResults.length > 0
  );
};

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

  let nodeIndex = 0;
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

    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const epubElement = walker.currentNode.parentElement;
      epubElement.setAttribute("nodeid", nodeIndex);
      epubElement.classList.add("epub-node");
      nodeIndex += 1;
    }

    const nodes = page.querySelectorAll("img, image, a");
    if (!nodes) {
      continue;
    }
    for (const node of nodes) {
      const tag = node.tagName.toLowerCase();
      if (tag === "img") {
        const src = node.getAttribute("src");
        if (!src) {
          continue;
        }
        node.style.objectFit = "scale-down";
        node.style.margin = "auto";
        node.setAttribute("ogsrc", node.getAttribute("src"));
      } else if (tag === "image") {
        node.style.height = "100%";
        node.style.width = "";
        node.getAttribute("src") &&
          node.setAttribute("ogsrc", node.getAttribute("src"));
        node.getAttribute("href") &&
          node.setAttribute("oghref", node.getAttribute("href"));
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
  if (Array.isArray(tocRef.navMap?.navPoint) === false) {
    tocRef.navMap.navPoint = [tocRef.navMap.navPoint];
  }
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
    if (elementMap.has(item["@_idref"]) === false) {
      continue;
    }
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
      (obj) => obj?.hasOwnProperty("@_refines") === false
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
  if (metadata.hasOwnProperty("creator")) {
    addAllCreators(metadata.creator);
  }
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

export const handlePathHref =
  (
    spineIndex,
    spineIndexMap,
    setProgress,
    setProgressWithoutAddingHistory,
    setForceFocus
  ) =>
  (path) => {
    if (window.getSelection().isCollapsed === false) {
      return;
    }
    if (path.startsWith("http")) {
      return window.open(path, "_blank");
    }
    if (path.startsWith("../")) {
      path = path.substring(3);
    } else if (path.startsWith("/")) {
      path = path.substring(1);
    }

    const pathHasId = path.includes("#");
    const pathWithoutId = pathHasId
      ? path.substring(0, path.indexOf("#"))
      : path;
    let newSpineIndex = spineIndex;
    if (pathWithoutId.length > 0) {
      newSpineIndex = getEpubValueFromPath(spineIndexMap, pathWithoutId);
    }
    if (typeof newSpineIndex === "number" && newSpineIndex !== spineIndex) {
      if (pathHasId) {
        setProgressWithoutAddingHistory(newSpineIndex, 0);
      } else {
        setProgress(newSpineIndex, 0);
      }
    }
    if (pathHasId) {
      const linkFragment = path.substring(path.indexOf("#") + 1);
      const forceFocus = {
        type: "element",
        attributeName: "id",
        attributeValue: linkFragment,
      };
      setForceFocus(forceFocus);
    }
  };

const readingOrderComparator = (dir) => (a, b) =>
  dir === "asc"
    ? Number.parseInt(a.selectedRangeIndexed.startContainerId) -
        Number.parseInt(b.selectedRangeIndexed.startContainerId) ||
      Number.parseInt(a.selectedRangeIndexed.startOffset) -
        Number.parseInt(b.selectedRangeIndexed.startOffset)
    : Number.parseInt(b.selectedRangeIndexed.endContainerId) -
        Number.parseInt(a.selectedRangeIndexed.endContainerId) ||
      Number.parseInt(b.selectedRangeIndexed.endOffset) -
        Number.parseInt(a.selectedRangeIndexed.endOffset);

const dateComparator = (dir, get) => (a, b) =>
  dir === "asc"
    ? Date.parse(get(a)) - Date.parse(get(b))
    : Date.parse(get(b)) - Date.parse(get(a));

const sortTypeToKey = {
  date_modified: "dateModified",
  date_created: "dateCreated",
};

const getSortedGroupedNotes = (sort, epubObject) => {
  const epubNotes = epubObject.notes;
  const spine = epubObject.spine;
  const sortType = sort.notes.type;
  const sortDirection = sort.notes.direction;
  const res = {};
  let prevChapter = null;
  for (const chapterNodes of Object.values(epubNotes)) {
    for (const [noteId, note] of Object.entries(chapterNodes)) {
      const chapterLabel = spine[note.spineIndex].label;
      if (prevChapter !== spine[note.spineIndex].label) {
        res[chapterLabel] = [];
      }
      prevChapter = chapterLabel;
      note.id = noteId;
      note.chapterLabel = chapterLabel;
      res[chapterLabel].push(note);
    }
  }
  if (sortType === "reading_order") {
    Object.values(res).forEach((list) =>
      list.sort(readingOrderComparator(sortDirection))
    );
  } else {
    Object.values(res).forEach((list) =>
      list.sort(
        dateComparator(sortDirection, (e) => e[sortTypeToKey[sortType]])
      )
    );
  }
  return res;
};
const getSortedUngroupedNotes = (sort, epubObject) => {
  const epubNotes = epubObject.notes;
  const spine = epubObject.spine;
  const sortType = sort.notes.type;
  const sortDirection = sort.notes.direction;
  const res = [];
  for (const chapterNodes of Object.values(epubNotes)) {
    for (const [noteId, note] of Object.entries(chapterNodes)) {
      const chapterLabel = spine[note.spineIndex].label;
      note.id = noteId;
      note.chapterLabel = chapterLabel;
      res.push(note);
    }
  }
  if (sortType === "reading_order") {
    res.sort(readingOrderComparator(sortDirection));
  } else {
    res.sort(dateComparator(sortDirection, (e) => e[sortTypeToKey[sortType]]));
  }
  return res;
};
export const getSortedNotes = (sort, epubObject) => {
  const sortGrouped = sort.notes.grouped;
  if (sortGrouped) {
    return getSortedGroupedNotes(sort, epubObject);
  } else {
    return getSortedUngroupedNotes(sort, epubObject);
  }
};

const localeComparator = (dir, get) => (a, b) =>
  dir === "asc" ? get(a).localeCompare(get(b)) : get(b).localeCompare(get(a));

export const getSortedMemos = (sort, epubObject) => {
  const memos = epubObject.memos;
  const sortType = sort.memos.type;
  const sortDirection = sort.memos.direction;
  if (sortType === "alphabetical") {
    return Object.entries(memos).sort(
      localeComparator(sortDirection, (e) => e[0])
    );
  } else {
    return Object.entries(memos).sort(
      dateComparator(sortDirection, (e) => e[1][sortTypeToKey[sortType]])
    );
  }
};

export const chapterNameToElementId = (chapterName) =>
  `chapter-name-${chapterName.toLowerCase().split(" ").join("-")}`;
