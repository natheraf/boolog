import {
  getSearchPreview,
  getXPathSearchExpression,
} from "../../utils/stringUtils";

const handleSearchOnElement = (needle, element) => {
  const text = element.textContent;
  const textLower = text.toLowerCase();
  let index = textLower.indexOf(needle);
  const res = [];
  while (index !== -1) {
    const nodeId = element.getAttribute("nodeid");
    res.push({
      startContainerId: nodeId,
      endContainerId: nodeId,
      startOffset: index,
      endOffset: index + needle.length,
      ...getSearchPreview(text, index, needle),
    });
    index = textLower.indexOf(needle, index + needle.length);
  }
  return res;
};

export const handleSearchOnDocument = (needle, doc) => {
  needle = needle.toLowerCase();
  const xPathExpression = getXPathSearchExpression(needle);
  const evaluateResults = document.evaluate(
    xPathExpression,
    doc,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null
  );
  const res = [];
  let node = evaluateResults.iterateNext();
  while (node) {
    res.push(...handleSearchOnElement(needle, node));
    node = evaluateResults.iterateNext();
  }
  return res;
};

export const waitForElement = (selector) =>
  new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

export const waitForElements = (selector) =>
  new Promise((resolve) => {
    if (document.querySelectorAll(selector)) {
      return resolve(document.querySelectorAll(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelectorAll(selector)) {
        observer.disconnect();
        resolve(document.querySelectorAll(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

export const changePermanentMarksToTemporary = (noteId) => {
  const nodes = [...document.getElementsByClassName(noteId)];
  for (const node of nodes) {
    node.classList.remove(noteId, "mark");
    node.classList.add("temporary-mark");
    node.removeAttribute("noteid");
    node.removeAttribute("style");
  }
};

export const deleteNodesAndLiftChildren = (nodes) => {
  const updates = [];
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    while (node.firstChild) {
      frag.appendChild(node.firstChild);
    }
    updates.push([node, frag]);
  }
  updates.forEach(([node, frag]) => {
    const parent = node.parentElement;
    parent.insertBefore(frag, node);
    parent.removeChild(node);
    parent.normalize();
  });
};

/**
 * @param {HTMLCollection} nodes
 */
export const disableHighlightNodes = (nodes) => {
  deleteNodesAndLiftChildren(nodes);
};

export const handleDeleteMark = (noteId) =>
  disableHighlightNodes(document.getElementsByClassName(noteId));

export const changeTemporaryMarksToPermanent = (nodes, noteId) => {
  for (const node of nodes) {
    node.classList.remove("temporary-mark");
    node.classList.add(noteId, "mark");
    node.setAttribute("noteid", noteId);
  }
};

export const handleInjectingMarkToTextNodes = (
  doc,
  noteId,
  selectedRange,
  highlightColor,
  markClassName
) => {
  const markNode = (node, noteId, highlightColor) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const mark = doc.createElement("span");
      mark.classList.add(markClassName);
      if (noteId) {
        mark.classList.add(noteId);
        mark.setAttribute("noteid", noteId);
      }
      mark.setAttribute(
        "style",
        `background-color: ${highlightColor} !important;`
      );
      node.parentNode.replaceChild(mark, node);
      mark.appendChild(node);
      return;
    }
    for (const child of node.childNodes) {
      markNode(child, noteId, highlightColor);
    }
  };

  const injectMarkToNode = (
    node,
    noteId,
    index,
    start,
    end,
    highlightColor
  ) => {
    const length = node.textContent.length;
    if (index + length < start) {
      return length;
    }
    if (start <= index && index + length <= end) {
      markNode(node, noteId, highlightColor);
      return length;
    }
    if (node.nodeType !== Node.TEXT_NODE) {
      for (const child of [...node.childNodes]) {
        index += injectMarkToNode(
          child,
          noteId,
          index,
          start,
          end,
          highlightColor
        );
        if (index > end) {
          break;
        }
      }
      return length;
    }
    if (start <= index && end <= index + length) {
      const notMarked = node.splitText(length - (index + length - end));
      node.parentNode.replaceChild(notMarked, node);
      notMarked.parentNode.insertBefore(node, notMarked);
      markNode(node, noteId, highlightColor);
      notMarked.parentNode.normalize();
    } else if (start >= index && index + length <= end) {
      const marked = node.splitText(start - index);
      node.parentNode.replaceChild(marked, node);
      marked.parentNode.insertBefore(node, marked);
      markNode(marked, noteId, highlightColor);
      node.parentNode.normalize();
    } else {
      // between: index > start && end < index + length
      const unmarkedEnd = node.splitText(length - (index + length - end));
      const markedBetween = node.splitText(start - index);
      node.parentNode.replaceChild(unmarkedEnd, node);
      unmarkedEnd.parentNode.insertBefore(markedBetween, unmarkedEnd);
      markedBetween.parentNode.insertBefore(node, markedBetween);
      markNode(markedBetween, noteId, highlightColor);
      node.parentNode.normalize();
    }
    return length;
  };

  if (selectedRange.startContainer === selectedRange.endContainer) {
    injectMarkToNode(
      selectedRange.startContainer,
      noteId,
      0,
      selectedRange.startOffset,
      selectedRange.endOffset,
      highlightColor
    );
  } else {
    let it = selectedRange.startContainer;
    let next = it;
    while (next.nextSibling === null) {
      next = next.parentNode;
    }
    next = next.nextSibling;
    injectMarkToNode(
      it,
      noteId,
      0,
      selectedRange.startOffset,
      Infinity,
      highlightColor
    );
    it = next;
    while (it !== selectedRange.endContainer) {
      if (it.contains(selectedRange.endContainer)) {
        it = it.firstChild;
      } else {
        markNode(it, noteId, highlightColor);
        while (it.nextSibling === null) {
          it = it.parentNode;
        }
        it = it.nextSibling;
      }
    }
    injectMarkToNode(it, noteId, 0, 0, selectedRange.endOffset, highlightColor);
  }
};

const getTextNodeAtOffset = (doc, node, offset) => {
  const walker = doc.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const length = textNode.textContent.length;
    if (offset <= length) {
      return { textNode, offset };
    }
    offset -= length;
  }
  return null;
};

export const handleInjectingMarkToEpubNodes = (
  doc,
  noteId,
  selectedRange,
  highlightColor,
  markClassName
) => {
  const startResult = getTextNodeAtOffset(
    doc,
    selectedRange.startContainer,
    selectedRange.startOffset
  );
  const endResult = getTextNodeAtOffset(
    doc,
    selectedRange.endContainer,
    selectedRange.endOffset
  );
  selectedRange = {
    startContainer: startResult.textNode,
    startOffset: startResult.offset,
    endContainer: endResult.textNode,
    endOffset: endResult.offset,
  };
  handleInjectingMarkToTextNodes(
    doc,
    noteId,
    selectedRange,
    highlightColor,
    markClassName
  );
};

export const getFirstTextNode = (node) => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  if (walker.nextNode()) {
    return walker.currentNode;
  }
  return null;
};

export const getLastTextNode = (node) => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let lastNode = null;
  while (walker.nextNode()) {
    lastNode = walker.currentNode;
  }
  return lastNode;
};

export const getNearestEpubAncestor = (node) => {
  let it = node;
  while (
    it &&
    (it.nodeType !== Node.ELEMENT_NODE ||
      it.classList.contains("epub-node") === false)
  ) {
    it = it.parentElement;
  }
  return it;
};

const trimRangeOfEpubNodes = (doc, startId, endId) => {
  let it = doc.querySelector(`[nodeid="${startId}"]`);
  while (it.parentElement !== null) {
    const parent = it.parentElement;
    while (it.previousSibling !== null) {
      parent.removeChild(it.previousSibling);
    }
    it = it.parentElement;
  }
  it = doc.querySelector(`[nodeid="${endId}"]`);
  while (it.parentElement !== null) {
    const parent = it.parentElement;
    while (it.nextSibling !== null) {
      parent.removeChild(it.nextSibling);
    }
    it = it.parentElement;
  }
  return doc;
};

export const trimAndHighlight = (
  stringHTML,
  selectedRangeIndexed,
  highlightColor,
  nodeId
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stringHTML, "text/html");
  trimRangeOfEpubNodes(
    doc,
    selectedRangeIndexed.startContainerId,
    selectedRangeIndexed.endContainerId
  );

  const selectedRange = structuredClone(selectedRangeIndexed);
  selectedRange.startContainer = doc.querySelector(
    `[nodeId="${selectedRange.startContainerId}"]`
  );
  selectedRange.endContainer = doc.querySelector(
    `[nodeId="${selectedRange.endContainerId}"]`
  );
  handleInjectingMarkToEpubNodes(
    doc,
    nodeId,
    selectedRange,
    highlightColor,
    "temporary-mark"
  );
  for (const node of doc.querySelectorAll(`[nodeid]`)) {
    node.removeAttribute("nodeid");
  }
  return doc.getElementById("inner-content").outerHTML;
};

export const getPreviousTextNode = (node) => {
  do {
    if (node.previousElementSibling) {
      node = node.previousElementSibling;
    } else {
      while (node.previousElementSibling === null) {
        node = node.parentElement;
      }
    }
    while (node.lastChild !== null) {
      node = node.lastChild;
    }
  } while (node.nodeType !== Node.TEXT_NODE);
  return node;
};

export const attachOnClickListenersToLinkElements = (
  handlePathHref,
  abortControllerSignal
) => {
  [...document.getElementsByClassName("content")].forEach((content) => {
    content?.querySelectorAll("a[linkto]").forEach((node) => {
      const tag = node.tagName.toLowerCase();
      if (tag === "a" && node.getAttribute("linkto") !== "null") {
        node.style.cursor = "pointer";
        node.addEventListener(
          "click",
          () => {
            handlePathHref(node.getAttribute("linkto"));
          },
          { signal: abortControllerSignal }
        );
      }
    });
  });
};

export const clearTemporaryMarks = () => {
  if (document.getElementsByClassName("temporary-mark").length > 0) {
    deleteNodesAndLiftChildren(
      document.getElementsByClassName("temporary-mark")
    );
  }
};

export const trimSelectedRange = (range) => {
  let startOffset = range.startOffset;
  const startTextContent = range.startContainer.textContent;
  while (
    startOffset < startTextContent.length &&
    startTextContent[startOffset] === " "
  ) {
    startOffset += 1;
  }
  let endOffset = range.endOffset;
  while (
    endOffset > 0 &&
    range.endContainer.textContent[endOffset - 1] === " "
  ) {
    endOffset -= 1;
  }
  range.setStart(range.startContainer, startOffset);
  range.setEnd(range.endContainer, endOffset);
};

export const getActualEndContainer = (range) => {
  let { endContainer, endOffset, startContainer } = range;

  let it = endContainer;
  let deepestCommonAncestor = endContainer;
  while (!deepestCommonAncestor.contains(startContainer)) {
    it = deepestCommonAncestor;
    deepestCommonAncestor = deepestCommonAncestor.parentElement;
  }

  if (endOffset === 0 && endContainer) {
    it = it.previousElementSibling;
    if (it) {
      endContainer = it;
      endOffset = it.textContent.length;
    } else if (endContainer.parentNode) {
      endContainer = endContainer.parentNode;
      endOffset = endContainer.textContent.length;
    }
  }

  return [endContainer, endOffset];
};

export const setRangeToTextNodesOnly = (range) => {
  const content = document.getElementById("content");
  if (range.endContainer instanceof HTMLElement) {
    let previousEpubNodeTextNode = null;
    let walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (
        [Node.DOCUMENT_POSITION_PRECEDING].includes(
          textNode.compareDocumentPosition(range.endContainer)
        )
      ) {
        break;
      }
      if (getNearestEpubAncestor(textNode)) {
        previousEpubNodeTextNode = textNode;
      }
    }
    range.setEnd(previousEpubNodeTextNode, previousEpubNodeTextNode.length);
  }
};

export const isIOS = () => {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

export const handleShowCursor = (element, show) => {
  element.style.cursor = show ? "auto" : "none";
};

export const handleMouseMoveHiderOnTimeout = (
  event,
  epubBody,
  hideCursorTimeoutId
) => {
  handleShowCursor(epubBody, true);
  clearTimeout(hideCursorTimeoutId.current);
  if (event.target.classList.contains("epub-node")) {
    hideCursorTimeoutId.current = setTimeout(() => {
      handleShowCursor(epubBody, false);
    }, 5000);
  }
};

export const updateNoteMarksOrDeleteInDOM = (note, deleteMark) => {
  const nodes = document.getElementsByClassName(note.id);
  if (deleteMark) {
    disableHighlightNodes(nodes);
  } else {
    for (const node of nodes) {
      node.setAttribute(
        "style",
        `background-color: ${note.highlightColor} !important;`
      );
    }
  }
};
