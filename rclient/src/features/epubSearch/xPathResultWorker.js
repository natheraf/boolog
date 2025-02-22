onmessage = ({ data: { text, searchNeedle, spineSearchPointer, page } }) => {
  let index = text.indexOf(searchNeedle);
  const indexAppearances = [];
  while (index !== -1) {
    indexAppearances.push(index);
    index = text.indexOf(searchNeedle, index + 1);
  }
  const res = [];
  for (const index of indexAppearances) {
    res.push({
      spineIndex: spineSearchPointer,
      page,
      textIndex: index,
      previewStart: text.substring(index - 50, index),
      needle: searchNeedle,
      previewEnd: text.substring(
        index + searchNeedle.length,
        index + searchNeedle.length + 50
      ),
    });
  }
  postMessage(res);
};
