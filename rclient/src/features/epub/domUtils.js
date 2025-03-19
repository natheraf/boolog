export const deleteClassOfNodesAndLiftChildren = (nodes) => {
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
