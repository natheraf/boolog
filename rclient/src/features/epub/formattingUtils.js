export const putFormattingStyleElement = (theme, formatting) => {
  const format = structuredClone(formatting);

  const remoteFont = format.fontFamily.kind === "webfonts#webfont";
  const linkId = "webfont-google";
  if (remoteFont) {
    const linkElement =
      document.querySelector(`#${linkId}`) ?? document.createElement("link");
    linkElement.id = linkId;
    linkElement.rel = "stylesheet";
    linkElement.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(
      format.fontFamily.family
    )}`;
    document.head.insertAdjacentElement("afterbegin", linkElement);
  } else {
    document.getElementById(linkId)?.remove();
  }

  if (format.pageColor === "Standard") {
    format.pageColor = theme.palette.background.paper;
  }

  if (format.textColor === "Standard") {
    format.textColor = theme.palette.text.primary;
  }

  const fontFamily = remoteFont
    ? `"${format.fontFamily.family}"`
    : format.fontFamily.value;
  const userFormattingStyle = `
      ${
        format.fontSize === "Original"
          ? ""
          : `font-size: ${format.fontSize}rem;`
      }
      ${
        format.lineHeight === "Original"
          ? ""
          : `line-height: ${format.lineHeight / 10} !important;`
      }
      ${
        fontFamily === "inherit" ? "" : `font-family: ${fontFamily} !important;`
      }
      ${
        format.textAlign.value === "inherit"
          ? ""
          : `text-align: ${format.textAlign.value} !important;`
      }
      ${
        format.fontWeight === "Original"
          ? ""
          : `font-weight: ${format.fontWeight} !important;`
      }
      ${
        format.textColor === "Original"
          ? ""
          : `color: ${format.textColor} !important;`
      }
      ${
        format.pageColor === "Original"
          ? ""
          : `background-color: ${format.pageColor} !important;`
      }
      ${
        format.textIndent === "Original"
          ? ""
          : `text-indent: ${format.textIndent}rem !important;`
      }
    `;
  const styleId = `epub-css-user-formatting`;
  const styleElement =
    document.querySelector(`#${styleId}`) ?? document.createElement("style");
  styleElement.id = styleId;
  styleElement.innerHTML = `#content *, .content * {\n${userFormattingStyle}\n}`;
  document.head.insertAdjacentElement("beforeend", styleElement);
  return styleId;
};

export const putHighlightStyles = () => {
  const highlightStyles = `
      .temporary-mark, .mark {
        all: unset !important;
        font-size: inherit !important; 
        font-weight: inherit !important;
      }
    `;
  const styleId = `epub-css-highlight-styles`;
  const styleElement =
    document.querySelector(`#${styleId}`) ?? document.createElement("style");
  styleElement.id = styleId;
  styleElement.innerHTML = `#content *, .content * {\n${highlightStyles}\n}`;
  document.head.insertAdjacentElement("beforeend", styleElement);
  return styleId;
};

const presets = new Map([
  ["midNight", { pageColor: "black", textColor: "#ffffff90" }],
  ["dark", { pageColor: "black", textColor: "white" }],
  ["twilight", { pageColor: "#FDF4DC", textColor: "black" }],
  ["light", { pageColor: "white", textColor: "black" }],
  ["custom", {}],
]);

export const getFormattingWithPreset = (presetName, formatting) => {
  return { ...formatting, ...presets.get(presetName) };
};
