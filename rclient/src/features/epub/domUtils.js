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

const getClosestEpubNode = (node) => {
  let it = node;
  while (it !== null && it.classList?.contains("epub-node") === false) {
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
