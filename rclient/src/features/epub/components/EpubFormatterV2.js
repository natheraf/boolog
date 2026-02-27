import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";

/**
 * ReaderFormat Rewritten
 * @param {*} param0
 */
export const EpubFormatterV2 = ({ epubObject, formatting, setFormatting }) => {
  const theme = useTheme();
  const stylingElementIds = React.useRef([]);
  const timeoutToUpdateWindowSize = React.useRef(null);

  const highlightBorderSafety = 25;
  const updateWindowSize = () => {
    clearTimeout(timeoutToUpdateWindowSize.current);
    timeoutToUpdateWindowSize.current = setTimeout(() => {
      if (window.innerWidth - highlightBorderSafety < formatting.pageWidth) {
        const newPageWidth = window.innerWidth - highlightBorderSafety;
        setFormatting((prev) => ({
          ...prev,
          pageWidth: newPageWidth,
        }));
      }
    }, 500);
  };

  const clearEpubStyles = () => {
    stylingElementIds.current.forEach((id) =>
      document.getElementById(id)?.remove()
    );
  };

  const putFormattingStyleElement = (forceFormatting) => {
    const format = structuredClone(forceFormatting ?? formatting);

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

  const putHighlightStyles = () => {
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

  React.useEffect(() => {
    for (const [key, value] of Object.entries(epubObject.css)) {
      const styleElement = document.createElement("style");
      styleElement.id = `epub-css-${key}`;
      styleElement.innerHTML = `#content *, .content * {\n${value}\n}`;
      document.head.insertAdjacentElement("beforeend", styleElement);
      stylingElementIds.current.push(styleElement.id);
    }
    stylingElementIds.current.push(putHighlightStyles());
    // stylingElementIds.current.push(putFormattingStyleElement());
    window.addEventListener("resize", updateWindowSize);
    return () => {
      clearEpubStyles();
      window.removeEventListener("resize", updateWindowSize);
    };
  }, []);
};

EpubFormatterV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
};
