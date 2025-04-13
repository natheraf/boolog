import { removeListener } from "../listenerManager";

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
 * Deletes notes nodes with no dependencies or marks them for deletion if have dependence. Also removes on click listener.
 * @param {string} nodeId
 * @param {object} spineNotes
 * @param {HTMLCollection} nodes
 */
export const disableHighlightNodes = (nodeId, spineNotes, nodes) => {
  /**
   * determine if we need to delete or mark note as deleted
   * delete: when node is already marked for deletion and there are no child elements (non-text nodes)
   * mark: when there are child elements
   */
  const adjList = new Map(); // dom structure but reverse edges of notes
  const reverseAdjList = new Map(); // reverse edges of DOM
  for (const [nodeId, note] of Object.entries(spineNotes)) {
    const rangeIndex = note.selectedRangeIndexed;
    if (reverseAdjList.has(nodeId) === false) {
      reverseAdjList.set(nodeId, new Set());
    }
    if (rangeIndex.startParentNoteId !== null) {
      reverseAdjList.get(nodeId).add(rangeIndex.startParentNoteId);
    }
    if (rangeIndex.endParentNoteId !== null) {
      reverseAdjList.get(nodeId).add(rangeIndex.endParentNoteId);
    }

    if (rangeIndex.startParentNoteId !== null) {
      if (adjList.has(rangeIndex.startParentNoteId) === false) {
        adjList.set(rangeIndex.startParentNoteId, new Set());
      }
      adjList.get(rangeIndex.startParentNoteId).add(nodeId);
    }

    if (rangeIndex.endParentNoteId !== null) {
      if (adjList.has(rangeIndex.endParentNoteId) === false) {
        adjList.set(rangeIndex.endParentNoteId, new Set());
      }
      adjList.get(rangeIndex.endParentNoteId).add(nodeId);
    }
  }

  const dfs = (node) => {
    if (
      node === null ||
      spineNotes.hasOwnProperty(node) === false ||
      spineNotes[node].hasOwnProperty("deleted") === false ||
      (adjList.has(node) && adjList.get(node).size > 0)
    ) {
      return false;
    }
    deleteNodesAndLiftChildren(document.getElementsByClassName(node));
    delete spineNotes[node];
    for (const parent of reverseAdjList.get(node)) {
      if (parent !== null) {
        adjList.get(parent).delete(node);
        dfs(parent);
      }
    }
    return true;
  };
  const deleted = dfs(nodeId);
  if (deleted) {
    return;
  }

  for (const node of nodes) {
    node.style.backgroundColor = "rgba(0, 0, 0, 0)";
    removeListener(node, "click");
  }
};

export const handleInjectingMark = (noteId, selectedRange, highlightColor) => {
  let noteNodeIndex = 0;
  const markNode = (node, noteId, highlightColor) => {
    if ((node.textContent?.trim()?.length ?? 0) === 0) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const mark = document.createElement("span");
      mark.classList.add(noteId, "mark");
      mark.setAttribute("nodeid", `${noteId}-${noteNodeIndex}`);
      noteNodeIndex += 1;
      mark.setAttribute("noteid", noteId);
      mark.style.backgroundColor = highlightColor;
      mark.style.fontSize = "inherit";
      mark.style.fontWeight = "inherit";
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
    while (it.nextSibling === null) {
      it = it.parentNode;
    }
    let next = it.nextSibling;
    injectMarkToNode(
      it,
      noteId,
      0,
      selectedRange.startOffset,
      Infinity,
      highlightColor
    );
    it = next;
    while (
      it !== selectedRange.endContainer &&
      it.parentElement !== selectedRange.endContainer
    ) {
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
