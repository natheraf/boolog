const removeEventListenerMap = new Map();

export const addListener = (node, type, fn) => {
  node.addEventListener(type, fn);
  const nodeId = node.getAttribute("nodeid");
  const key = `${nodeId}|${type}`;
  if (removeEventListenerMap.has(key) === false) {
    removeEventListenerMap.set(key, []);
  }
  removeEventListenerMap
    .get(key)
    .push(() => node.removeEventListener(type, fn));
};

export const removeListener = (node, type) => {
  const nodeId = node.getAttribute("nodeid");
  const key = `${nodeId}|${type}`;
  if (removeEventListenerMap.has(key) === false) {
    return;
  }
  removeEventListenerMap.get(key).forEach((fn) => fn());
  removeEventListenerMap.delete(key);
};
