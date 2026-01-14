export const escapeXPath = (str) => {
  if (str.includes("'") && !str.includes('"')) {
    return `"${str}"`;
  }
  if (str.includes('"') && !str.includes("'")) {
    return `'${str}'`;
  }
  if (str.includes("'") && str.includes('"')) {
    const parts = str.split("'");
    const concatParts = parts.map((part) => `'${part}'`).join(`,"'",`);
    return `concat(${concatParts})`;
  }
  return `'${str}'`;
};

export const getXPathSearchExpression = (needle) => {
  const listOfTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "table"];
  const prefix = `.//*[${listOfTags
    .map((tag) => `self::${tag}`)
    .join(" or ")}]`;
  /**
   * without ignoring capitalization
   * `${prefix}[contains(string(.), ${escapeXPath(needle)})]`
   */
  return `${prefix}[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), ${escapeXPath(
    needle
  )})]`;
};

export const getSearchPreview = (text, index, needle) => {
  const previewLength = 200 - needle.length;
  const half = Math.floor(previewLength / 2);
  const startIndex =
    index - half < 0
      ? 0
      : text.indexOf(" ", index - half) >= index
      ? index - half
      : text.indexOf(" ", index - half);
  const unusedStartChars = half - (index - startIndex);
  let endIndex = Math.min(text.length, index + half + unusedStartChars);
  while (
    endIndex < text.length &&
    endIndex > index + needle.length &&
    text[endIndex] !== " "
  ) {
    endIndex -= 1;
  }
  if (endIndex === index) {
    endIndex = Math.min(text.length, index + 60 + unusedStartChars);
  }
  return {
    needle: text.substring(index, index + needle.length),
    previewPrefix: text.substring(startIndex, index),
    previewSuffix: text.substring(index + needle.length, endIndex),
  };
};
