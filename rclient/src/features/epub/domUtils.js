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
  });
};

export const disableHighlightNodes = (nodes) => {
  for (const node of nodes) {
    node.style.backgroundColor = "rgba(0, 0, 0, 0)";
    removeListener(node, "click");
  }
};

const markNode = (node, noteId, highlightColor) => {
  if ((node.textContent?.trim()?.length ?? 0) === 0) {
    return;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const mark = document.createElement("span");
    mark.classList.add(noteId, "mark");
    mark.setAttribute("noteid", noteId);
    mark.setAttribute("nodeid", noteId);
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

const injectMarkToNode = (node, noteId, index, start, end, highlightColor) => {
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

export const handleInjectingMark = (noteId, selectedRange, highlightColor) => {
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
