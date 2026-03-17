import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import TextDecreaseIcon from "@mui/icons-material/TextDecrease";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import SubjectIcon from "@mui/icons-material/Subject";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import HeightIcon from "@mui/icons-material/Height";
import VerticalAlignCenterIcon from "@mui/icons-material/VerticalAlignCenter";
import WidthNormalIcon from "@mui/icons-material/WidthNormal";
import WidthFullIcon from "@mui/icons-material/WidthFull";
import BookIcon from "@mui/icons-material/Book";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import { FormatLessBoldIcon } from "./components/FormatLessBoldIcon";

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

  if (format.pageColor === "Original") {
    format.pageColor = theme.palette.background.paper;
  }

  if (format.textColor === "Original") {
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

export const putHighlightStyles = (color, backgroundColor) => {
  const highlightStyles = `
      .temporary-mark, .mark {
        all: unset !important;
        font-size: inherit !important; 
        font-weight: inherit !important;
      }
      .temporary-mark {
        color: ${color} !important;
        background-color: ${backgroundColor} !important;
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

export const getFormattingWithPreset = (formatting) => {
  return { ...formatting, ...presets.get(formatting.present) };
};

export const formattingNumberFields = [
  {
    title: "Font Size",
    value: "fontSize",
    endText: "rem",
    decreaseIcon: TextDecreaseIcon,
    increaseIcon: TextIncreaseIcon,
  },
  {
    title: "Font Weight",
    value: "fontWeight",
    endText: "abs",
    advancedOption: true,
    decreaseIcon: FormatLessBoldIcon,
    increaseIcon: FormatBoldIcon,
  },
  {
    title: "Page Width",
    value: "pageWidth",
    endText: "px",
    advancedOption: true,
    decreaseIcon: WidthNormalIcon,
    increaseIcon: WidthFullIcon,
  },
  {
    title: "Page Height Margins",
    value: "pageHeightMargins",
    endText: "px",
    advancedOption: true,
    decreaseIcon: HeightIcon,
    increaseIcon: VerticalAlignCenterIcon,
    viewSpecific: ["page"],
  },
  {
    title: "Pages Shown",
    value: "pagesShown",
    endText: "pgs",
    advancedOption: true,
    viewSpecific: ["page"],
  },
  {
    title: "Indent",
    value: "textIndent",
    endText: "rem",
    advancedOption: true,
    decreaseIcon: FormatIndentDecreaseIcon,
    increaseIcon: FormatIndentIncreaseIcon,
  },
  {
    title: "Line Height",
    value: "lineHeight",
    endText: "u",
    decreaseIcon: DensitySmallIcon,
    increaseIcon: DensityMediumIcon,
  },
];

export const justifyIcons = new Map([
  ["inherit", BookIcon],
  ["start", FormatAlignLeftIcon],
  ["end", FormatAlignRightIcon],
  ["center", FormatAlignCenterIcon],
  ["justify", FormatAlignJustifyIcon],
]);

export const formatMemoKey = (key) => {
  if (!key) {
    return null;
  }
  key = key.toLowerCase();
  const apostrophes = ["’", "'", "ʼ"];
  for (const char of apostrophes) {
    if (
      (key.lastIndexOf("s") === key.length - 2 &&
        key.lastIndexOf(char) === key.length - 1) ||
      (key.lastIndexOf("s") === key.length - 1 &&
        key.lastIndexOf(char) === key.length - 2)
    ) {
      key = key.substring(0, key.lastIndexOf(char));
    }
  }
  return key;
};
