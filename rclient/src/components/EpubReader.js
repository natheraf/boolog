import * as React from "react";
import { useTheme } from "@emotion/react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import { ReaderFormat } from "./ReaderFormat";
import { convertFileToBlob } from "../api/IndexedDB/Files";

import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// refactor to use one ver with CreateBook.js:35 DialogSlideUpTransition()
const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const parseCSSText = (cssText) => {
  var cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ");
  var style = {},
    [, ruleName, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
  var cssToJs = (s) =>
    s.replace(/\W+\w/g, (match) => match.slice(-1).toUpperCase());
  var properties = rule
    .split(";")
    .map((o) => o.split(":").map((x) => x && x.trim()));
  for (var [property, value] of properties) style[cssToJs(property)] = value;
  return { cssText, ruleName, style };
}; // https://stackoverflow.com/a/43012849

let runInit = false;

export const EpubReader = ({ open, setOpen, epubObject }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);

  const contentElementRef = React.useRef(null);

  const defaultFormatting = {
    fontSize: 100,
    _fontSizeStep: 1,
    _fontSizeBounds: { min: 1, max: Infinity },
    lineHeight: 12,
    _lineHeightBounds: { min: 1, max: Infinity },
    _lineHeightStep: 1,
    pageMargins: 500,
    _pageMarginsStep: 50,
    _pageMarginsBounds: { min: 70, max: Infinity },
    pagesShown: 1,
    _pagesShownStep: 1,
    _pagesShownBounds: { min: 1, max: Infinity },
    fontFamily: { label: "Original", value: "inherit" },
    _fontFamilies: [
      // formatted for MUI Selector use
      { group: "none" },
      { label: "Original", value: "inherit" },

      { group: "Generic" },
      { label: "Serif", value: "serif" },
      { label: "Sans-Serif", value: "sans-serif" },
      { label: "Monospace", value: "monospace" },
      { label: "Cursive", value: "cursive" },
      { label: "Fantasy", value: "fantasy" },
      { label: "Math", value: "math" },
      { label: "Fangsong", value: "fangsong" },
      { label: "System-UI", value: "system-ui" },
    ],
    textAlign: { label: "Original", value: "inherit" },
    _textAlignments: [
      { label: "Original", value: "inherit" },
      { label: "Left", value: "start" },
      { label: "Middle", value: "center" },
      { label: "Right", value: "end" },
      { label: "Justified", value: "justify" },
    ],
  };

  const [formatting, setFormatting] = React.useState(
    structuredClone(defaultFormatting)
  );

  const structureRef = epubObject["OEBPS"];
  const contentRef = epubObject["opf"].package;

  const [spine, setSpine] = React.useState(null);
  const [hrefSpineMap, setHrefSpineMap] = React.useState(null);
  const [spinePointer, setSpinePointer] = React.useState(null);

  const [currentPage, setCurrentPage] = React.useState(0);
  const columnGap = 10;
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);
  const pageWidth = React.useMemo(() => {
    const value = windowWidth - formatting.pageMargins - columnGap;
    if (value <= 50) {
      setFormatting((prev) => ({ ...prev, pageMargins: 70 }));
    }
    return value;
  }, [formatting.pageMargins, windowWidth]);
  const pageHeight = React.useMemo(() => {
    const value = windowHeight - 88;
    document
      .getElementById("content")
      ?.querySelectorAll("img")
      .forEach((element) => {
        element.style.maxHeight = `${value}px`;
      });
    return value;
  }, [windowHeight]);

  const handleViewOutOfBounds = React.useCallback(() => {
    if (contentElementRef.current !== null) {
      const totalWidth = document.getElementById("content").scrollWidth;
      const totalPages =
        Math.floor(totalWidth / pageWidth) +
        +(
          formatting.pagesShown > 1 &&
          (totalWidth % pageWidth) / pageWidth > 1 / formatting.pagesShown
        );
      if (currentPage >= totalPages) {
        setCurrentPage(totalPages - 1);
      }
    }
  }, [currentPage, formatting, pageWidth]);

  React.useEffect(() => {
    if (contentElementRef.current !== null && spinePointer !== null) {
      const resizeObserver = new ResizeObserver((entries) => {
        handleViewOutOfBounds();
      });
      const innerContentElement =
        contentElementRef.current.children?.[0] ??
        document.getElementById("inner-content");
      if (innerContentElement) {
        resizeObserver.observe(innerContentElement);
      }
      return () => resizeObserver.disconnect();
    }
  }, [handleViewOutOfBounds, spinePointer]);

  const handlePathHref = React.useCallback(
    (path) => {
      if (path.startsWith("http")) {
        window.open(path, "_blank");
        return;
      }
      setCurrentPage(0);
      path = path.substring(path.indexOf("/") + 1);
      setSpinePointer(hrefSpineMap.get(path));
    },
    [hrefSpineMap]
  );

  const createReactDOM = async (htmlElement) => {
    if (htmlElement === null) {
      return null;
    }
    if (htmlElement.nodeName === "#text") {
      return htmlElement.data;
    }
    const tag = htmlElement.tagName.toLowerCase();
    if (tag === "br") {
      return React.createElement("br");
    }
    const props = {};
    for (const attribute of htmlElement.attributes) {
      if (attribute.name === "style") {
        props.style = parseCSSText(attribute.value).style;
      } else if (attribute.name === "class") {
        props.className = attribute.value;
      } else if (attribute.name !== "href") {
        props[attribute.name] = attribute.value;
      }
    }
    if (tag === "svg") {
      props.style = {
        height: pageHeight,
        width: pageWidth,
      };
    } else if (tag === "image") {
      let src = null;
      for (const key of ["xlink:href", "href"]) {
        if (htmlElement.getAttribute(key) !== null) {
          src = htmlElement.getAttribute(key);
        }
      }
      if (src !== null) {
        const path = src
          .substring(src.indexOf("..") === -1 ? 0 : src.indexOf("/") + 1)
          .split("/");
        const fileName = path.pop();
        let it = structureRef;
        for (const node of path) {
          it = it[node];
        }
        const imgFile = it[fileName];
        const blob = await convertFileToBlob(imgFile);
        props["href"] = URL.createObjectURL(blob);
        props["height"] = "100%";
        delete props.width;
      }
    } else if (tag === "img") {
      const src = htmlElement.getAttribute("src");
      const path = src
        .substring(src.indexOf("..") === -1 ? 0 : src.indexOf("/") + 1)
        .split("/");
      const fileName = path.pop();
      let it = structureRef;
      for (const node of path) {
        it = it[node];
      }
      const imgFile = it[fileName];
      const blob = await convertFileToBlob(imgFile);
      props.src = URL.createObjectURL(blob);
      props.style = {
        maxHeight: pageHeight,
        objectFit: "scale-down",
        margin: "auto",
      };
    } else if (tag === "a" && htmlElement.getAttribute("href") !== null) {
      const href = htmlElement.getAttribute("href");
      props.style = { color: "lightblue" };
      props.linkto =
        href.startsWith("http") === false && href.indexOf("#") !== -1
          ? href.substring(0, href.indexOf("#"))
          : href;
    }

    const reactChildren = [];
    for (const child of htmlElement.childNodes) {
      reactChildren.push(await createReactDOM(child));
    }

    return React.createElement(tag, props, ...reactChildren);
  };

  const processSpine = async () => {
    const manifestRef = contentRef.manifest.item;

    const elementMap = new Map();
    for (const item of manifestRef) {
      const path = item["@_href"].split("/");
      let it = structureRef;
      for (const node of path) {
        it = it[node];
      }
      if (it.type === "css") {
        const styleElement = document.createElement("style");
        styleElement.id = `epub-css-${it.name}`;
        styleElement.innerHTML = `#content, #previous-content {\n${it.text}\n}`;
        document.head.insertAdjacentElement("beforeend", styleElement);
        continue;
      }
      if (it.hasOwnProperty("filename")) {
        continue;
      }

      const page = document.createElement("html");
      page.innerHTML = it.text;
      const body = page.querySelector("body") ?? page.querySelector("section");
      const pageContent = document.createElement("div");
      pageContent.id = "inner-content";
      pageContent.innerHTML = body.innerHTML;
      const reactNode = await createReactDOM(pageContent);

      if (item.hasOwnProperty("@_properties")) {
        elementMap.set(item["@_properties"], reactNode);
      }
      elementMap.set(item["@_id"], {
        section: reactNode,
        href: item["@_href"],
      });
    }

    const spineStack = [];
    const spineMap = new Map();
    const spineRef = contentRef.spine.itemref;
    for (const item of spineRef) {
      spineMap.set(elementMap.get(item["@_idref"]).href, spineStack.length);
      spineStack.push(elementMap.get(item["@_idref"]).section);
    }
    setSpine(spineStack);
    setHrefSpineMap(spineMap);
    return spineStack;
  };

  const handleClose = () => {
    setOpen(false);
  };

  // add event listener to epub anchors
  React.useEffect(() => {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      document
        .getElementById("content")
        ?.querySelectorAll("a[linkto]")
        .forEach((node) => {
          node.addEventListener("click", () => {
            handlePathHref(node.getAttribute("linkto"));
          });
        });
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, [handlePathHref]);

  const handleNextPage = React.useCallback(() => {
    const totalWidth = document.getElementById("content").scrollWidth;
    const totalPages =
      Math.floor(totalWidth / pageWidth) +
      +(
        formatting.pagesShown > 1 &&
        (document.getElementById("content").scrollWidth % pageWidth) /
          pageWidth >
          1 / formatting.pagesShown
      );
    if (currentPage >= totalPages - 1) {
      setCurrentPage(0);
      setSpinePointer((prev) => Math.min(spine.length - 1, prev + 1));
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, pageWidth, formatting, spine]);

  const handlePreviousPage = React.useCallback(() => {
    const previousTotalWidth =
      document.getElementById("previous-content").scrollWidth;
    const totalPages =
      Math.floor(previousTotalWidth / pageWidth) +
      +(
        formatting.pagesShown > 1 &&
        (document.getElementById("previous-content").scrollWidth % pageWidth) /
          pageWidth >
          1 / formatting.pagesShown
      );
    if (currentPage === 0) {
      setCurrentPage(totalPages - 1);
      setSpinePointer((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage, pageWidth, formatting]);

  const handleOnKeyDown = React.useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        handlePreviousPage();
      } else if (event.key === "ArrowRight") {
        handleNextPage();
      }
    },
    [handleNextPage, handlePreviousPage]
  );
  // prob did implementation wrong cause this reruns every page
  React.useEffect(() => {
    if (spine !== null) {
      document.addEventListener("keydown", handleOnKeyDown);
      return () => document.removeEventListener("keydown", handleOnKeyDown);
    }
  }, [handleOnKeyDown, spine]);

  const putFormattingStyleElement = (forceFormatting) => {
    const format = forceFormatting ?? formatting;
    const userFormattingStyle = `
      font-size: ${format.fontSize}%; 
      line-height: ${format.lineHeight / 10} !important;
      ${
        format.fontFamily.value === "inherit"
          ? ""
          : `font-family: ${format.fontFamily.value} !important;`
      }
      ${
        format.textAlign.value === "inherit"
          ? ""
          : `text-align: ${format.textAlign.value} !important;`
      }
    `;
    const id = `epub-css-user-formatting`;
    const styleElement =
      document.querySelector(`#${id}`) ?? document.createElement("style");
    styleElement.id = id;
    styleElement.innerHTML = `#content *, #previous-content * {\n${userFormattingStyle}\n}`;
    document.head.insertAdjacentElement("beforeend", styleElement);
  };

  const handleSetFormatting = (formatting) => {
    setFormatting(formatting);
    putFormattingStyleElement(formatting);
  };

  const processSpineAndRenderEpubDOM = () =>
    new Promise((resolve, reject) => {
      processSpine().then(resolve);
    });

  const updateWindowSize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
  };

  // on load
  React.useEffect(() => {
    if (spine === null && runInit === false) {
      runInit = true;
      processSpineAndRenderEpubDOM().then(() => {
        if (spinePointer === null) {
          setSpinePointer(0);
        }
        putFormattingStyleElement();
      });
    }
    window.addEventListener("resize", updateWindowSize);

    return () => {
      window.removeEventListener("resize", updateWindowSize);
      runInit = false;
    };
  }, []);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
    >
      <AppBar
        sx={{
          position: "sticky",
          top: 0,
          width: "100%",
        }}
      >
        <Toolbar
          component={Stack}
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
          spacing={2}
        >
          <Tooltip title="esc">
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" noWrap>
            {contentRef?.metadata?.["dc:title"]?.["#text"] ??
              contentRef?.metadata?.["dc:title"] ??
              "error"}
          </Typography>
          <Stack direction={"row"} spacing={2}>
            <ReaderFormat
              formatting={formatting}
              setFormatting={handleSetFormatting}
              defaultFormatting={defaultFormatting}
            />
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack sx={{ overflow: "hidden" }}>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent={"center"}
          sx={{ mt: "10px", height: "100%" }}
          spacing={1}
        >
          <Button
            variant="text"
            onClick={handlePreviousPage}
            sx={{
              width: "100%",
              height: "100%",
              "&.MuiButtonBase-root:hover": {
                backgroundColor: "transparent",
              },
              filter: `blur(100px)`,
              justifyContent: "flex-start",
            }}
            startIcon={<NavigateBeforeIcon htmlColor={"gray"} />}
            disableRipple={!theme.transitions.reduceMotion}
          />
          <Box
            sx={{
              maxWidth: `${pageWidth}px`,
              minWidth: `${pageWidth}px`,
              overflow: "hidden",
            }}
          >
            <Box
              id="content"
              ref={contentElementRef}
              sx={{
                height: pageHeight,
                columnFill: "balance",
                columnGap: `${columnGap}px`,
                columnWidth: `${
                  (pageWidth - columnGap * formatting.pagesShown) /
                  formatting.pagesShown
                }px`,
                transform: `translate(-${
                  currentPage * (pageWidth + columnGap)
                }px);`,
              }}
            >
              {spine?.[spinePointer ?? -1] ??
                "something went wrong...<br/> spine is missing"}
            </Box>
          </Box>
          <Button
            variant="text"
            onClick={handleNextPage}
            sx={{
              width: "100%",
              height: "100%",
              "&.MuiButtonBase-root:hover": {
                backgroundColor: "transparent",
              },
              filter: `blur(100px)`,
              justifyContent: "flex-end",
            }}
            endIcon={<NavigateNextIcon htmlColor={"gray"} />}
            disableRipple={!theme.transitions.reduceMotion}
          />
        </Stack>
        <Box sx={{ width: pageWidth, visibility: "hidden" }}>
          <Box
            id="previous-content"
            sx={{
              height: pageHeight,
              overflow: "visible",
              columnFill: "balance",
              columnGap: `${columnGap}px`,
              columnWidth: `${
                (pageWidth - columnGap * formatting.pagesShown) /
                formatting.pagesShown
              }px`,
            }}
          >
            {spine?.[(spinePointer ?? 0) - 1] ??
              "something went wrong...<br/> spine is missing"}
          </Box>
        </Box>
      </Stack>
    </Dialog>
  );
};
