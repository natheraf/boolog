import * as React from "react";
import { useTheme } from "@emotion/react";
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Dialog,
  IconButton,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";

import { ReaderFormat } from "./ReaderFormat";
import { convertFileToBlob } from "../api/IndexedDB/Files";

import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PropTypes from "prop-types";

// refactor to use one ver with CreateBook.js:35 DialogSlideUpTransition()
const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CircularProgressWithLabel = (props) => {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary" }}
        >
          {`${Math.round(props.value)}`}
        </Typography>
      </Box>
    </Box>
  );
};

const parseCSSText = (cssText) => {
  const cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ");
  const style = {},
    [, ruleName, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
  const cssToJs = (s) =>
    s.replace(/\W+\w/g, (match) => match.slice(-1).toUpperCase());
  const properties = rule
    .split(";")
    .map((o) => o.split(":").map((x) => x && x.trim()));
  for (const [property, value] of properties) style[cssToJs(property)] = value;
  return { cssText, ruleName, style };
}; // https://stackoverflow.com/a/43012849

let runInit = false;

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

export const EpubReader = ({ open, setOpen, epubObject }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const [isLoading, setIsLoading] = React.useState(true);

  const contentElementRef = React.useRef(null);

  const [formatting, setFormatting] = React.useState(
    structuredClone(defaultFormatting)
  );

  const structureRef = epubObject["OEBPS"];
  const contentRef = epubObject["opf"].package;
  const tocRef = epubObject["ncx"].ncx;

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

  const [linkFragment, setLinkFragment] = React.useState(null);

  const [spineSearchPointer, setSpineSearchPointer] = React.useState(null);
  const searchNeedle = React.useRef(null);
  const searchResultAccumulator = React.useRef([]);
  const [searchResult, setSearchResult] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState(null);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = React.useState(null);
  const [webWorker, setWebWorker] = React.useState(null);

  const searchEpub = (needle) => {
    needle = needle.trim();
    if (needle.length === 0) {
      return;
    }
    searchNeedle.current = needle;
    searchResultAccumulator.current = [];
    setSearchResult([]);
    setSpineSearchPointer(0);
  };

  const searchContent = React.useCallback(() => {
    if (
      spineSearchPointer !== null &&
      document.getElementById("previous-content")
    ) {
      const needle = searchNeedle.current;
      const result = document.evaluate(
        `.//*[text()[contains(.,'${searchNeedle.current}')]]`,
        document.getElementById("previous-content"),
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null
      );
      let nodeNumber = 0;
      let node = result.iterateNext();
      while (node) {
        if (spineSearchPointer === null || needle !== searchNeedle.current) {
          return;
        }
        const content = document
          .getElementById("content")
          .getBoundingClientRect();
        const fragment = node.getBoundingClientRect();
        const page = Math.floor(
          Math.floor(fragment.left) / Math.floor(pageWidth + columnGap)
        );
        if (fragment.top < content.bottom) {
          node = result.iterateNext();
          continue;
        }

        const text = node.textContent;
        webWorker.postMessage({
          text,
          searchNeedle: searchNeedle.current,
          spineSearchPointer,
          page,
          bleeds: fragment.right - fragment.left - (pageWidth + columnGap) > 0,
          nodeNumber,
        });

        nodeNumber += 1;
        node = result.iterateNext();
      }
    }
  }, [pageWidth, spineSearchPointer, webWorker]);

  const incrementSearchPointer = React.useCallback(() => {
    if (spineSearchPointer !== null && spineSearchPointer + 1 < spine.length) {
      setSpineSearchPointer((prev) => (prev ?? 0) + 1);
    } else {
      searchNeedle.current = null;
      setSearchResult(searchResultAccumulator.current);
      setSpineSearchPointer(null);
    }
  }, [spine, spineSearchPointer]);

  React.useEffect(() => {
    searchContent();
    incrementSearchPointer();
  }, [incrementSearchPointer, searchContent]);

  const handleSearchOnKeyDown = (event) => {
    if (event.key === "Enter") {
      searchEpub(searchValue);
    }
  };

  const handleSearchInputOnChange = (event, newInputValue) => {
    setSearchValue(newInputValue);
  };

  const handleSearchOnChange = (event, value) => {
    setSpinePointer(value.spineIndex);
    setCurrentPage(value.page);
    setSelectedSearchResult(value);
    handleSearchOnBlur();
  };

  React.useEffect(() => {
    if (selectedSearchResult !== null) {
      const result = document.evaluate(
        `.//*[text()[contains(.,'${[selectedSearchResult.needle].join("")}')]]`,
        document.getElementById("content"),
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null
      );
      const content = document
        .getElementById("next-page-button")
        .getBoundingClientRect();
      let nodeNumber = 0;
      let node = result.iterateNext();
      while (node) {
        const fragment = node.getBoundingClientRect();
        if (fragment.top > content.bottom) {
          node = result.iterateNext();
          continue;
        }
        if (nodeNumber < selectedSearchResult.nodeNumber) {
          nodeNumber += 1;
          node = result.iterateNext();
          continue;
        }

        const keysForMarkId = ["spineIndex", "page", "textIndex", "nodeNumber"];
        const markId = keysForMarkId
          .map((key) => selectedSearchResult[key])
          .join("|");
        const markIsPresent = Boolean(document.getElementById(markId));
        const inner = node.innerHTML;
        let index = 0;
        const text = node.textContent;
        let textContentIndex = 0;
        if (markIsPresent === false) {
          while (index < inner.length) {
            if (
              inner[index] === "<" &&
              inner[index] !== text[textContentIndex]
            ) {
              index = inner.indexOf(">", index + 1) + 1;
              continue;
            }
            if (textContentIndex === selectedSearchResult.textIndex) {
              node.innerHTML = `${inner.substring(
                0,
                index
              )}<mark id="${markId}">${
                selectedSearchResult.needle
              }</mark>${inner.substring(
                index + selectedSearchResult.needle.length
              )}`;
              break;
            }
            index += 1;
            textContentIndex += 1;
          }
        }
        if (markId !== null && document.getElementById(markId)) {
          const marked = document
            .getElementById(markId)
            .getBoundingClientRect();
          if (marked.left > content.right) {
            setCurrentPage((prev) => prev + 1);
          }
        }
        break;
      }
      setSelectedSearchResult(null);
    }
  }, [selectedSearchResult]);

  const handleSearchOnBlur = () => {
    setSearchFocused(false);
    searchNeedle.current = null;
    searchResultAccumulator.current = [];
    setSpineSearchPointer(null);
    setSearchResult([]);
  };

  const handleSearchOnFocus = () => {
    setSearchFocused(true);
    setSearchResult([]);
  };

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
    if (contentElementRef.current !== null) {
      const resizeObserver = new ResizeObserver(handleViewOutOfBounds);
      const innerContentElement =
        contentElementRef.current.children?.[0] ??
        document.getElementById("inner-content");
      if (innerContentElement) {
        resizeObserver.observe(innerContentElement);
      }
      return () => resizeObserver.disconnect();
    }
  }, [handleViewOutOfBounds]);

  const handlePathHref = React.useCallback(
    (path) => {
      if (path.startsWith("http")) {
        return window.open(path, "_blank");
      }
      setCurrentPage(0);
      path = path.substring(path.indexOf("/") + 1);
      if (path.indexOf("#") !== -1) {
        setLinkFragment(path.substring(path.indexOf("#") + 1));
        path = path.substring(0, path.indexOf("#"));
      }
      setSpinePointer(hrefSpineMap.get(path));
    },
    [hrefSpineMap]
  );

  React.useEffect(() => {
    if (linkFragment !== null && document.getElementById(linkFragment)) {
      const content = document
        .getElementById("content")
        .getBoundingClientRect();
      const fragment = document
        .getElementById(linkFragment)
        .getBoundingClientRect();
      if (fragment.top > content.bottom) {
        return;
      }
      const pageDelta = Math.floor(
        (Math.floor(fragment.left) - Math.floor(content.left)) /
          Math.floor(pageWidth + columnGap)
      );
      setCurrentPage((prev) => prev + pageDelta);
      setLinkFragment(null);
    }
  }, [linkFragment, pageWidth]);

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
      props.style = { color: "lightblue", cursor: "pointer" };
      props.linkto = htmlElement.getAttribute("href");
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

    const navMap = new Map(); // content -> nav label / chapter name
    for (const navPoint of tocRef.navMap.navPoint) {
      navMap.set(
        navPoint.content?.["@_src"],
        navPoint.navLabel?.text ?? "error: no label"
      );
    }

    const spineStack = [];
    const spineMap = new Map();
    const spineRef = contentRef.spine.itemref;
    for (const item of spineRef) {
      spineMap.set(elementMap.get(item["@_idref"]).href, spineStack.length);
      spineStack.push({
        element: elementMap.get(item["@_idref"]).section,
        label:
          navMap.get(elementMap.get(item["@_idref"]).href) ??
          spineStack[spineStack.length - 1].label ??
          "No Chapter",
      });
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
      if (searchFocused) {
        return;
      }
      if (event.key === "ArrowLeft") {
        handlePreviousPage();
      } else if (event.key === "ArrowRight") {
        handleNextPage();
      }
    },
    [handleNextPage, handlePreviousPage, searchFocused]
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

    const webWorker = new Worker(
      new URL("../features/epubSearch/xPathResultWorker.js", import.meta.url)
    );
    webWorker.addEventListener("message", (event) => {
      if (event.data?.[0]?.needle !== searchNeedle.current) {
        return;
      }
      searchResultAccumulator.current.push(...event.data);
    });
    setWebWorker(webWorker);

    return () => {
      webWorker?.terminate();
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
          <Stack
            alignItems={"center"}
            direction="row"
            spacing={1}
            sx={{ overflow: "hidden" }}
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
              {greaterThanSmall
                ? tocRef.docTitle.text ??
                  contentRef?.metadata?.["dc:title"]?.["#text"] ??
                  contentRef?.metadata?.["dc:title"] ??
                  "error"
                : null}
            </Typography>
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <Autocomplete
              value={null}
              onChange={handleSearchOnChange}
              onInputChange={handleSearchInputOnChange}
              onKeyDown={handleSearchOnKeyDown}
              options={searchResult}
              onFocus={handleSearchOnFocus}
              onBlur={handleSearchOnBlur}
              aria-placeholder={searchNeedle.current}
              groupBy={(option) =>
                spine?.[option?.spineIndex]?.label ?? "No Chapter"
              }
              getOptionLabel={(option) =>
                option.previewStart + option.needle + option.previewEnd
              }
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={[
                    option.spineIndex,
                    option.page,
                    option.textIndex,
                    option.nodeNumber,
                  ].join("|")}
                >
                  <Stack>
                    <Typography variant="caption">{`Chapter page ${
                      option.page + 1
                    }`}</Typography>
                    <span>
                      <span style={{ color: "gray" }}>
                        {option.previewStart}
                      </span>
                      {option.needle}
                      <span style={{ color: "gray" }}>{option.previewEnd}</span>
                    </span>
                  </Stack>
                </Box>
              )}
              loading={searchNeedle.current !== null}
              loadingText={
                (spineSearchPointer ?? 0) >= (spine?.length ?? 0) - 2
                  ? "Loading results…"
                  : "Searching…"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchNeedle.current !== null ? (
                          (spineSearchPointer ?? 0) >=
                          (spine?.length ?? 0) - 2 ? (
                            <CircularProgress
                              color={"inherit"}
                              size={20}
                              disableShrink
                            />
                          ) : (
                            <CircularProgressWithLabel
                              value={
                                ((spineSearchPointer ?? 0) /
                                  (spine?.length ?? 0)) *
                                100
                              }
                              color={"inherit"}
                              size={20}
                              sx={{ circle: { transition: "none" } }}
                            />
                          )
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              size="small"
              disabled={spine === null}
              disableClearable
              sx={{ width: greaterThanSmall ? "300px" : "180px" }}
            />
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
              {spine?.[spinePointer ?? -1]?.element ??
                "something went wrong...<br/> spine is missing"}
            </Box>
          </Box>
          <Button
            id="next-page-button"
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
            {spine?.[spineSearchPointer ?? (spinePointer ?? 0) - 1]?.element ??
              "something went wrong...<br/> spine is missing"}
          </Box>
        </Box>
      </Stack>
    </Dialog>
  );
};

EpubReader.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  epubObject: PropTypes.object.isRequired,
};
