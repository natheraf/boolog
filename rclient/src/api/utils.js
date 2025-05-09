export const getMongoDBDotNotation = (object) =>
  getLevelDotNotation(object, Infinity);

export const getLevelDotNotation = (object, notationDepth, root) => {
  const res = {};
  const path = [];
  if (root !== undefined) {
    path.push(root);
  }
  const dfs = (data, depth, targetDepth) => {
    if (data === null) {
      return;
    }
    if (depth === targetDepth || typeof data !== "object" || data === null) {
      res[path.join(".")] = data;
      return;
    }
    for (const [key, value] of Object.entries(data)) {
      path.push(key);
      dfs(value, depth + 1, targetDepth + (notationDepth[key] ?? 0));
      path.pop();
    }
  };
  dfs(object, 0, notationDepth.root);
  return res;
};

/**
 * Does not support arrays
 * @param {object} object
 */
export const dotNotationToStandard = (object) => {
  const res = {};
  for (const [key, value] of Object.entries(object)) {
    let remainingKey = key.substring(key.indexOf(".") + 1);
    let it = res;
    while (remainingKey.length > 0) {
      const dotIndex =
        remainingKey.indexOf(".") === -1
          ? remainingKey.length
          : remainingKey.indexOf(".");
      const nextKey = remainingKey.substring(0, dotIndex);
      remainingKey = remainingKey.substring(dotIndex + 1);
      if (remainingKey.length === 0) {
        it[nextKey] = value;
        break;
      }
      if (it.hasOwnProperty(nextKey) === false) {
        it[nextKey] = {};
      }
      it = it[nextKey];
    }
  }
  return res;
};

export const dotNotationArrayToStandard = (array) => {
  const res = {};
  for (const value of array) {
    const key = value.key;
    let remainingKey = key.substring(key.indexOf(".") + 1);
    let it = res;
    while (remainingKey.length > 0) {
      const dotIndex =
        remainingKey.indexOf(".") === -1
          ? remainingKey.length
          : remainingKey.indexOf(".");
      const nextKey = remainingKey.substring(0, dotIndex);
      remainingKey = remainingKey.substring(dotIndex + 1);
      if (remainingKey.length > 0) {
        if (it.hasOwnProperty(nextKey) === false) {
          it[nextKey] = {};
        }
        it = it[nextKey];
        continue;
      }
      if (typeof value === "object" && value.hasOwnProperty(nextKey)) {
        it[nextKey] = value[nextKey];
      } else {
        it[nextKey] = value;
      }
    }
  }
  return res;
};

/**
 * destructive
 * @param {object} object
 * @param {object} target
 * @returns
 */
export const fillInObject = (object, target) => {
  const dfs = (object, target) => {
    if (typeof object !== "object" || object === null) {
      return;
    }
    for (const key of Object.keys(target)) {
      if (object.hasOwnProperty(key) === false) {
        object[key] = target[key];
        continue;
      }
      dfs(object[key], target[key]);
    }
  };
  dfs(object, target);
  return object;
};
