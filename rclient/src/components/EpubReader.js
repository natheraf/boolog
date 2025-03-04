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
  Divider,
} from "@mui/material";

import { ReaderFormat } from "./ReaderFormat";
import { defaultFormatting } from "../api/Local";
import {
  getPreference,
  getPreferenceWithDefault,
  putPreference,
} from "../api/IndexedDB/userPreferences";
import { AlertsContext } from "../context/Alerts";

import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PropTypes from "prop-types";
import { Loading } from "../features/loading/Loading";

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

let runInit = false;

export const EpubReader = ({ open, setOpen, epubObject, entryId }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const addAlert = React.useContext(AlertsContext).addAlert;
  const [isLoading, setIsLoading] = React.useState(true);

  const contentElementRef = React.useRef(null);

  const [formatting, setFormatting] = React.useState(
    structuredClone(defaultFormatting)
  );
  const [useGlobalFormatting, setUseGlobalFormatting] = React.useState(true);

  const spine = React.useRef(epubObject.spine);
  const hrefSpineMap = React.useRef(epubObject.spineIndexMap);
  const images = React.useRef(epubObject.images);

  const [spinePointer, setSpinePointer] = React.useState(null);

  const loadedImageURLs = React.useRef({});

  const [currentPage, setCurrentPage] = React.useState(0);
  const columnGap = 10;
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [pageHeight, setPageHeight] = React.useState(window.innerHeight - 88);
  const pageWidth = React.useMemo(() => {
    const value = windowWidth - formatting.pageMargins - columnGap;
    if (value <= 50) {
      setFormatting((prev) => ({ ...prev, pageMargins: 70 }));
    }
    return value;
  }, [formatting.pageMargins, windowWidth]);

  const [linkFragment, setLinkFragment] = React.useState(null);

  const [spineSearchPointer, setSpineSearchPointer] = React.useState(null);
  const searchNeedle = React.useRef(null);
  const searchResultAccumulator = React.useRef([]);
  const [searchResult, setSearchResult] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState(null);
  const [selectedSearchResult, setSelectedSearchResult] = React.useState(null);
  const searchResultElement = React.useRef(null);
  const searchResultElementClone = React.useRef(null);
  const [searchWebWorker, setSearchWebWorker] = React.useState(null);

  const epubStyleIds = React.useRef([]);

  const [loadingText, setLoadingText] = React.useState(null);
  const [subLoadingText, setSubLoadingText] = React.useState(null);
  const [subLoadingProgress, setSubLoadingProgress] = React.useState(null);

  const updateFormattingOnDB = (value) => {
    if (useGlobalFormatting) {
      putPreference({ key: "epubGlobalFormatting", value });
    }
    putPreference({
      key: entryId,
      value: { useGlobalFormatting, formatting: value },
    });
  };

  const setUseGlobalFormattingHelper = (newValue) => {
    if (newValue) {
      getPreference("epubGlobalFormatting").then((res) => {
        setFormatting(res.value);
        putFormattingStyleElement(res.value);
        putPreference({
          key: entryId,
          value: { useGlobalFormatting: newValue, formatting: res.value },
        });
      });
    } else {
      putPreference({
        key: entryId,
        value: { useGlobalFormatting: newValue, formatting },
      });
    }
    setUseGlobalFormatting(newValue);
  };

  const clearEpubStyles = () => {
    epubStyleIds.current.forEach((id) => document.getElementById(id)?.remove());
  };

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

  const getXPathSearchExpression = React.useCallback(
    (needle) => {
      const listOfTags = [
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "li",
        "table",
      ];
      if (needle && needle.indexOf(`'`) === -1) {
        return `.//*[${listOfTags
          .map((tag) => `self::${tag}`)
          .join(" or ")}][contains(string(.), '${needle}')]`;
      } else if (needle && needle.indexOf(`"`) === -1) {
        return `.//*[self::p or self::h1 or self::h2][contains(string(.), "${needle}")]`;
      }
      addAlert("Searching single and double quotes unsupported", "warning");
      return null;
    },
    [addAlert]
  );

  const searchContent = React.useCallback(() => {
    if (
      spineSearchPointer !== null &&
      document.getElementById("previous-content")
    ) {
      const needle = searchNeedle.current;
      const xPathExpression = getXPathSearchExpression(needle);
      if (xPathExpression === null) {
        searchNeedle.current = null;
        setSpineSearchPointer(null);
        return;
      }
      const result = document.evaluate(
        xPathExpression,
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
        searchWebWorker.postMessage({
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
  }, [
    getXPathSearchExpression,
    pageWidth,
    spineSearchPointer,
    searchWebWorker,
  ]);

  const incrementSearchPointer = React.useCallback(() => {
    if (
      spineSearchPointer !== null &&
      spineSearchPointer + 1 < spine.current.length
    ) {
      setSpineSearchPointer((prev) => (prev ?? 0) + 1);
    } else {
      searchNeedle.current = null;
      setSearchResult(searchResultAccumulator.current);
      setSpineSearchPointer(null);
    }
  }, [spineSearchPointer]);

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
      const xPathExpression = getXPathSearchExpression(
        selectedSearchResult.needle
      );
      if (xPathExpression === null) {
        return;
      }
      const result = document.evaluate(
        xPathExpression,
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
              searchResultElement.current = node;
              searchResultElementClone.current = node.cloneNode(true);
              node.parentElement.replaceChild(
                searchResultElementClone.current,
                node
              );
              searchResultElementClone.current.innerHTML = `${inner.substring(
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
          setLinkFragment(markId);
        }
        break;
      }
      setSelectedSearchResult(null);
    }
  }, [getXPathSearchExpression, selectedSearchResult]);

  /**
   * @deprecated
   */
  const cleanUpMarkNode = () => {
    if (searchResultElementClone.current !== null) {
      searchResultElementClone.current.parentElement.replaceChild(
        searchResultElement.current,
        searchResultElementClone.current
      );
      searchResultElement.current = null;
      searchResultElementClone.current = null;
    }
  };

  const handleSearchOnBlur = () => {
    searchNeedle.current = null;
    searchResultAccumulator.current = [];
    setSpineSearchPointer(null);
    setSearchResult([]);
  };

  const handleSearchOnFocus = () => {
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

  const handlePathHref = React.useCallback((path) => {
    if (path.startsWith("http")) {
      return window.open(path, "_blank");
    }
    setCurrentPage(0);
    path = path.substring(path.indexOf("/") + 1);
    if (path.indexOf("#") !== -1) {
      setLinkFragment(path.substring(path.indexOf("#") + 1));
      path = path.substring(0, path.indexOf("#"));
    }
    setSpinePointer(hrefSpineMap.current[path]);
  }, []);

  // handles setting page so fragment is visible
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
      setCurrentPage(pageDelta);
      setLinkFragment(null);
    }
  }, [linkFragment, pageWidth]);

  const handleClose = () => {
    setOpen(false);
  };

  /**
   * add event listener to epub anchors and create object urls for images
   * if too slow, look into adding id to elements, storing those ids in processEpub, then referencing them here so we can access elements with getElementById faster
   */
  React.useEffect(() => {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      document
        .getElementById("content")
        ?.querySelectorAll("a[linkto], img, image")
        .forEach(async (node) => {
          const tag = node.tagName.toLowerCase();
          if (tag === "a") {
            node.addEventListener("click", () => {
              handlePathHref(node.getAttribute("linkto"));
            });
          } else if (tag === "img") {
            const src = node
              .getAttribute("src")
              ?.substring(node.getAttribute("src").indexOf("/") + 1);
            if (!src || !images.current[src]) {
              return;
            }
            const url =
              loadedImageURLs.current[src] ??
              URL.createObjectURL(images.current[src]);
            node.src = url;
            loadedImageURLs.current[src] = url;
            node.style.objectFit = "scale-down";
            node.style.margin = "auto";
          } else if (tag === "image") {
            let src = null;
            for (const key of ["xlink:href", "href"]) {
              if (node.getAttribute(key) !== null) {
                src = node.getAttribute(key);
              }
            }
            src = src?.substring(src.indexOf("/") + 1);
            if (!src || !images.current[src]) {
              return;
            }
            const url =
              loadedImageURLs.current[src] ??
              URL.createObjectURL(images.current[src]);
            loadedImageURLs.current[src] = url;
            node.setAttribute("href", url);
            node.style.height = "100%";
            node.style.width = "";
          }
        });
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, [handlePathHref]);

  // add event listener to resize images
  React.useEffect(() => {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      document
        .getElementById("content")
        ?.querySelectorAll("img, svg")
        .forEach((element) => {
          element.style.maxHeight = `${pageHeight}px`;
        });
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, [pageHeight]);

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
      setSpinePointer((prev) => Math.min(spine.current.length - 1, prev + 1));
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, pageWidth, formatting]);

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
      if (document.activeElement.tagName === "INPUT") {
        return;
      }
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
    if (spine.current !== null) {
      document.addEventListener("keydown", handleOnKeyDown);
      return () => document.removeEventListener("keydown", handleOnKeyDown);
    }
  }, [handleOnKeyDown]);

  const putFormattingStyleElement = (forceFormatting) => {
    const format = forceFormatting ?? formatting;

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

    const fontFamily = remoteFont
      ? `"${format.fontFamily.family}"`
      : format.fontFamily.value;
    const userFormattingStyle = `
      font-size: ${format.fontSize}%; 
      line-height: ${format.lineHeight / 10} !important;
      ${
        fontFamily === "inherit" ? "" : `font-family: ${fontFamily} !important;`
      }
      ${
        format.textAlign.value === "inherit"
          ? ""
          : `text-align: ${format.textAlign.value} !important;`
      }
    `;
    const styleId = `epub-css-user-formatting`;
    const styleElement =
      document.querySelector(`#${styleId}`) ?? document.createElement("style");
    styleElement.id = styleId;
    styleElement.innerHTML = `#content *, #previous-content * {\n${userFormattingStyle}\n}`;
    document.head.insertAdjacentElement("beforeend", styleElement);
  };

  const handleSetFormatting = (formatting) => {
    updateFormattingOnDB(formatting);
    setFormatting(formatting);
    putFormattingStyleElement(formatting);
  };

  const updateWindowSize = () => {
    setWindowWidth(window.innerWidth);
    const pageHeight = window.innerHeight - 88;
    setPageHeight(pageHeight);
  };

  const handleClearObjectURLs = () => {
    for (const url of Object.values(loadedImageURLs.current)) {
      URL.revokeObjectURL(url);
    }
    loadedImageURLs.current = {};
  };

  // on load
  React.useEffect(() => {
    if (spinePointer === null) {
      for (const [key, value] of Object.entries(epubObject.css)) {
        const styleElement = document.createElement("style");
        styleElement.id = `epub-css-${key}`;
        styleElement.innerHTML = `#content, #previous-content {\n${value}\n}`;
        document.head.insertAdjacentElement("beforeend", styleElement);
        epubStyleIds.current.push(styleElement.id);
      }
      setSpinePointer(0);
    }

    getPreferenceWithDefault({
      key: "epubGlobalFormatting",
      value: defaultFormatting,
    }).then((res) => {
      const globalFormatting = res.value;
      getPreferenceWithDefault({
        key: entryId,
        value: { useGlobalFormatting: true, formatting: globalFormatting },
      }).then((res) => {
        const useGlobalFormatting = res.value.useGlobalFormatting;
        setUseGlobalFormatting(useGlobalFormatting);
        const nonGlobalFormatting = res.value.formatting;
        const formatting = useGlobalFormatting
          ? globalFormatting
          : nonGlobalFormatting;
        setFormatting(formatting);
        putFormattingStyleElement(formatting);
      });
    });

    window.addEventListener("resize", updateWindowSize);

    const searchWebWorker = new Worker(
      new URL("../features/epub/xPathResultWorker.js", import.meta.url)
    );
    searchWebWorker.addEventListener("message", (event) => {
      if (event.data?.[0]?.needle !== searchNeedle.current) {
        return;
      }
      searchResultAccumulator.current.push(...event.data);
    });
    setSearchWebWorker(searchWebWorker);

    return () => {
      searchWebWorker?.terminate();
      window.removeEventListener("resize", updateWindowSize);
      runInit = false;
      clearEpubStyles();
      handleClearObjectURLs();
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
              {greaterThanSmall ? "add title" : null}
            </Typography>
          </Stack>
          <Stack direction={"row"} spacing={2}>
            {/**
             * @todo maybe move search component out
             */}
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
                spine.current?.[option?.spineIndex]?.label ?? "No Chapter"
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
                (spineSearchPointer ?? 0) >= (spine.current?.length ?? 0) - 2
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
                          (spine.current?.length ?? 0) - 2 ? (
                            <CircularProgress
                              color={"inherit"}
                              size={20}
                              disableShrink
                            />
                          ) : (
                            <CircularProgressWithLabel
                              value={
                                ((spineSearchPointer ?? 0) /
                                  (spine.current?.length ?? 0)) *
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
              disabled={spine.current === null}
              disableClearable
              sx={{ width: greaterThanSmall ? "300px" : "180px" }}
            />
            <ReaderFormat
              formatting={formatting}
              setFormatting={handleSetFormatting}
              defaultFormatting={defaultFormatting}
              useGlobalFormatting={useGlobalFormatting}
              setUseGlobalFormatting={setUseGlobalFormattingHelper}
            />
          </Stack>
        </Toolbar>
      </AppBar>
      {spinePointer === null ? (
        // <Loading
        //   loadingText={loadingText}
        //   subLoadingText={subLoadingText}
        //   subLoadingProcess={subLoadingProgress}
        // />
        "Loading, please wait..."
      ) : (
        <Stack sx={{ overflow: "hidden" }}>
          <Stack
            direction="row"
            alignItems={"center"}
            justifyContent={"center"}
            sx={{ mt: "10px", height: "100%" }}
            spacing={1}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                opacity: 0.4,
              }}
            >
              <Divider
                orientation="vertical"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  visibility: formatting.showDividers ? "visible" : "hidden",
                }}
              />
              <NavigateBeforeIcon
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  margin: "auto",
                  visibility: formatting.showArrows ? "visible" : "hidden",
                }}
                htmlColor={"gray"}
              />
              <Button
                variant="text"
                onClick={handlePreviousPage}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  "&.MuiButtonBase-root:hover": {
                    backgroundColor: "transparent",
                  },
                  filter: `blur(100px)`,
                  justifyContent: "flex-start",
                }}
                disableRipple={!theme.transitions.reduceMotion}
              />
            </Box>
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
                dangerouslySetInnerHTML={{
                  __html:
                    spine.current?.[spinePointer ?? -1]?.element ??
                    "something went wrong...<br/> spine is missing",
                }}
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                opacity: 0.4,
              }}
            >
              <Divider
                orientation="vertical"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  visibility: formatting.showDividers ? "visible" : "hidden",
                }}
              />
              <NavigateNextIcon
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: "auto",
                  visibility: formatting.showArrows ? "visible" : "hidden",
                }}
                htmlColor={"gray"}
              />
              <Button
                id="next-page-button"
                variant="text"
                onClick={handleNextPage}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  "&.MuiButtonBase-root:hover": {
                    backgroundColor: "transparent",
                  },
                  filter: `blur(100px)`,
                  justifyContent: "flex-end",
                }}
                disableRipple={!theme.transitions.reduceMotion}
              />
            </Box>
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
              dangerouslySetInnerHTML={{
                __html:
                  spine.current?.[spineSearchPointer ?? (spinePointer ?? 0) - 1]
                    ?.element ??
                  "something went wrong...<br/> spine is missing",
              }}
            />
          </Box>
        </Stack>
      )}
    </Dialog>
  );
};

EpubReader.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  epubObject: PropTypes.object.isRequired,
  entryId: PropTypes.string.isRequired,
};
