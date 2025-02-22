onmessage = ({
  data: { text, searchNeedle, spineSearchPointer, page, bleeds },
}) => {
  let index = text.indexOf(searchNeedle);
  const indexAppearances = [];
  while (index !== -1) {
    indexAppearances.push(index);
    index = text.indexOf(searchNeedle, index + 1);
  }
  const res = [];
  for (const index of indexAppearances) {
    const previewLength = 130 - searchNeedle.length;
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
      endIndex > index + searchNeedle.length &&
      text[endIndex] !== " "
    ) {
      endIndex -= 1;
    }
    if (endIndex === index) {
      endIndex = Math.min(text.length, index + 60 + unusedStartChars);
    }
    res.push({
      spineIndex: spineSearchPointer,
      page,
      textIndex: index,
      previewStart: text.substring(startIndex, index),
      needle: searchNeedle,
      previewEnd: text.substring(index + searchNeedle.length, endIndex),
      randomKey: Math.floor(Math.random() * 100000),
      bleeds,
    });
  }
  postMessage(res);
};
