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
import {
  getPreference,
  updatePreference,
} from "../api/IndexedDB/userPreferences";
import { AlertsContext } from "../context/Alerts";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PropTypes from "prop-types";
import { Loading } from "../features/loading/Loading";
import { TableOfContents } from "../features/epub/components/TableOfContents";
import { Annotator } from "../features/epub/components/Annotator";

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

export const EpubReader = ({ open, setOpen, epubObject, entryId }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const addAlert = React.useContext(AlertsContext).addAlert;
  const [isLoading, setIsLoading] = React.useState(true);

  const contentElementRef = React.useRef(null);

  const [formatting, setFormatting] = React.useState(
    epubObject.formatting.value
  );
  const [useGlobalFormatting, setUseGlobalFormatting] = React.useState(
    epubObject.formatting.useGlobalFormatting
  );

  const spine = React.useRef(epubObject.spine);
  const hrefSpineMap = React.useRef(epubObject.spineIndexMap);
  const images = React.useRef(epubObject.images);
  const chapterMeta = React.useRef(epubObject.chapterMeta);

  const [spinePointer, setSpinePointer] = React.useState(
    epubObject?.progress?.spine ?? 0
  );

  const visitedSpineIndexes = React.useRef(new Set());
  const [loadedImageURLs, setLoadedImageURLs] = React.useState({});

  const leftOverHeight = 68;
  const appBarHeight = 48;
  const leftOverNavHeight = Math.floor((leftOverHeight - appBarHeight) / 2);
  const pageNavigateHeight = leftOverNavHeight;
  const [totalPagesForNavigator, setTotalPagesForNavigator] = React.useState(0);
  const arrayForPageNavigator = React.useMemo(
    () => [...Array(totalPagesForNavigator).keys()],
    [totalPagesForNavigator]
  );
  const arrayForPreviousChapterNavigator = React.useMemo(
    () =>
      spinePointer === null || spinePointer === spine.current.length - 1
        ? []
        : [...Array(spine.current[spinePointer].backCount).keys()],
    [spinePointer]
  );
  const arrayForNextChapterNavigator = React.useMemo(
    () =>
      spinePointer === null || spinePointer === spine.current.length - 1
        ? []
        : [...Array(spine.current[spinePointer].frontCount).keys()],
    [spinePointer]
  );
  const spineNavigateHeight = leftOverNavHeight;
  const arrayForSpineNavigator = React.useMemo(() => chapterMeta.current, []);

  const [currentPage, setCurrentPage] = React.useState(0);
  const columnGap = 10;
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const getDialogContentHeight = () =>
    window.innerHeight -
    leftOverHeight +
    (!formatting.showPageNavigator + !formatting.showSpineNavigator) *
      leftOverNavHeight;
  const [dialogContentHeight, setDialogContentHeight] = React.useState(
    getDialogContentHeight
  );
  const pageHeight = React.useMemo(
    () => dialogContentHeight - formatting.pageHeightMargins,
    [dialogContentHeight, formatting.pageHeightMargins]
  );
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

  const bookTotalWords =
    spine.current[spine.current.length - 1].onGoingWordCount;
  const currentContentTotalWords = React.useMemo(
    () => spine.current[spinePointer]?.wordCount ?? 0,
    [spinePointer]
  );
  const totalOnGoingWords = React.useMemo(
    () => spine.current[spinePointer]?.onGoingWordCount ?? 0,
    [spinePointer]
  );

  const functionsForNextRender = React.useRef([]);

  const [searchFocused, setSearchFocused] = React.useState(false);

  const timeOutToSetProgress = React.useRef(null);

  const getChapterPartWidthInNav = React.useCallback(
    (index, part) => {
      let spineIndex = spinePointer;
      if (part === "previous") {
        spineIndex =
          spinePointer - (spine.current[spinePointer].backCount - index);
      }
      if (part === "next") {
        spineIndex = spinePointer + index + 1;
      }
      return Math.max(
        2,
        Math.ceil(
          ((spine.current[spineIndex]?.wordCount ?? 1) /
            (chapterMeta.current[spine.current[spineIndex].chapterMetaIndex]
              ?.wordCount ?? 1)) *
            100
        )
      );
    },
    [spinePointer]
  );

  const updateFormattingOnDB = (value) => {
    if (useGlobalFormatting) {
      updatePreference({ key: "epubGlobalFormatting", formatting: value });
    }
    updatePreference({
      key: entryId,
      formatting: {
        useGlobalFormatting,
        value,
      },
    });
  };

  const setUseGlobalFormattingHelper = (newValue) => {
    if (newValue) {
      getPreference("epubGlobalFormatting").then((res) => {
        setFormatting(res.formatting);
        updatePreference({
          key: entryId,
          formatting: {
            useGlobalFormatting: newValue,
            formatting: res.formatting,
          },
        });
      });
    } else {
      updatePreference({
        key: entryId,
        formatting: {
          useGlobalFormatting: newValue,
          formatting,
        },
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
          chapterPartNumber:
            (spine.current[spineSearchPointer]?.backCount ?? 0) + 1,
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
    cleanUpMarkNode();
    goToAndPreloadImages(value.spineIndex, value.page);
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
              let currentIndex = index;
              let needleIndex = 0;
              const markedNeedleBuilder = [];
              while (needleIndex < selectedSearchResult.needle.length) {
                if (
                  inner[currentIndex] === "<" &&
                  inner[currentIndex] !==
                    selectedSearchResult.needle[needleIndex]
                ) {
                  markedNeedleBuilder.push(`</mark>`);
                  while (
                    inner.indexOf('"', currentIndex) !== -1 &&
                    inner.indexOf('"', currentIndex) <
                      inner.indexOf(">", currentIndex)
                  ) {
                    currentIndex = inner.indexOf('"', currentIndex + 1) + 1;
                  }
                  const tagEndIndex = inner.indexOf(">", currentIndex + 1) + 1;
                  markedNeedleBuilder.push(
                    inner.substring(currentIndex, tagEndIndex)
                  );
                  currentIndex = tagEndIndex;
                  markedNeedleBuilder.push(
                    `<mark style="font-size: inherit;" class="${markId}">`
                  );
                } else {
                  markedNeedleBuilder.push(inner[currentIndex]);
                  currentIndex += 1;
                  needleIndex += 1;
                }
              }
              searchResultElementClone.current.innerHTML = `${inner.substring(
                0,
                index
              )}<mark style="font-size: inherit;" id="${markId}">${markedNeedleBuilder.join(
                ""
              )}</mark>${inner.substring(currentIndex)}`;
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

  const handleSearchIconClick = () => {
    setSearchFocused(true);
  };

  const handleSearchOnBlur = () => {
    searchNeedle.current = null;
    searchResultAccumulator.current = [];
    setSpineSearchPointer(null);
    setSearchResult([]);
    setSearchFocused(false);
  };

  const handleSearchOnFocus = () => {
    setSearchResult([]);
  };

  const getCurrentTotalPages = React.useCallback(() => {
    return document.getElementById("content")
      ? Math.floor(document.getElementById("content").scrollWidth / pageWidth) +
          +(
            formatting.pagesShown > 1 &&
            (document.getElementById("content").scrollWidth % pageWidth) /
              pageWidth >
              1 / formatting.pagesShown
          )
      : 0;
  }, [formatting, pageWidth]);

  const updateProgressToDb = React.useCallback(
    (newSpineIndex, newCurrentPage) => {
      clearTimeout(timeOutToSetProgress.current);
      timeOutToSetProgress.current = setTimeout(
        () =>
          updatePreference({
            key: entryId,
            progress: {
              spine: newSpineIndex ?? spinePointer,
              part: (newCurrentPage ?? currentPage) / getCurrentTotalPages(),
            },
          }),
        1000
      );
    },
    [currentPage, entryId, getCurrentTotalPages, spinePointer]
  );

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

  const preloadImages = React.useCallback(
    (spinePointer) => {
      const loadedImages = {};
      for (const index of [spinePointer - 1, spinePointer, spinePointer + 1]) {
        if (
          index < 0 ||
          index >= spine.current.length ||
          visitedSpineIndexes.current.has(index)
        ) {
          continue;
        }
        visitedSpineIndexes.current.add(index);
        const parser = new DOMParser();
        const page = parser.parseFromString(
          spine.current[index].element,
          "text/html"
        );
        const nodes = page?.querySelectorAll("img, image");
        for (const node of nodes) {
          const tag = node.tagName.toLowerCase();
          if (tag === "img") {
            const src = node
              .getAttribute("src")
              ?.substring(node.getAttribute("src").startsWith("../") * 3);
            if (!src || !images.current[src]) {
              return;
            }
            const url =
              loadedImages[src] ??
              loadedImageURLs[src] ??
              URL.createObjectURL(images.current[src]);
            node.src = url;
            loadedImages[src] = url;
            if (["DIV", "SECTION"].includes(node.parentElement.tagName)) {
              node.style.display = "block";
            }
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
              loadedImages[src] ??
              loadedImageURLs[src] ??
              URL.createObjectURL(images.current[src]);
            loadedImages[src] = url;
            node.setAttribute("href", url);
            node.style.height = "100%";
            node.style.width = "";
          }
        }
        spine.current[index].element = page.documentElement.outerHTML;
      }
      setLoadedImageURLs((prev) => ({ ...prev, ...loadedImages }));
    },
    [loadedImageURLs]
  );

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
        ?.querySelectorAll("a[linkto]")
        .forEach(async (node) => {
          const tag = node.tagName.toLowerCase();
          if (tag === "a") {
            node.addEventListener("click", () => {
              handlePathHref(node.getAttribute("linkto"));
            });
          }
        });
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      functionsForNextRender.current.forEach((fn) => fn());
      functionsForNextRender.current = [];
      setTotalPagesForNavigator(getCurrentTotalPages());
      document
        .getElementById("content")
        ?.querySelectorAll("img, svg")
        .forEach((element) => {
          element.style.maxHeight = `${pageHeight}px`;
        });
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, [getCurrentTotalPages, pageHeight]);

  // add event listener to resize images
  // React.useEffect(() => {
  //   const config = { childList: true, subtree: true };
  //   const observer = new MutationObserver((mutationList, observer) => {
  //     document
  //       .getElementById("content")
  //       ?.querySelectorAll("img, svg")
  //       .forEach((element) => {
  //         element.style.maxHeight = `${pageHeight}px`;
  //       });
  //   });
  //   observer.observe(document.body, config);
  //   return () => observer.disconnect();
  // }, [pageHeight]);

  const handleNextPage = React.useCallback(() => {
    cleanUpMarkNode();
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
      setSpinePointer((prev) => {
        preloadImages(prev + 1);
        const value = Math.min(spine.current.length - 1, prev + 1);
        updateProgressToDb(value, 0);
        return value;
      });
    } else {
      setCurrentPage((prev) => {
        updateProgressToDb(null, prev + 1);
        return prev + 1;
      });
    }
  }, [pageWidth, formatting, currentPage, preloadImages, updateProgressToDb]);

  const handlePreviousPage = React.useCallback(() => {
    cleanUpMarkNode();
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
      setSpinePointer((prev) => {
        preloadImages(prev - 1);
        const value = Math.max(0, prev - 1);
        updateProgressToDb(value, totalPages - 1);
        return value;
      });
    } else {
      setCurrentPage((prev) => {
        updateProgressToDb(null, prev - 1);
        return prev - 1;
      });
    }
  }, [pageWidth, formatting, currentPage, preloadImages, updateProgressToDb]);

  const turnToLastPage = React.useCallback(() => {
    const totalWidth = document.getElementById("content").scrollWidth;
    const totalPages =
      Math.floor(totalWidth / pageWidth) +
      +(
        formatting.pagesShown > 1 &&
        (document.getElementById("content").scrollWidth % pageWidth) /
          pageWidth >
          1 / formatting.pagesShown
      );
    setCurrentPage(totalPages - 1);
  }, [formatting, pageWidth]);

  const goToAndPreloadImages = React.useCallback(
    (spineIndex, page = 0) => {
      preloadImages(spineIndex);
      setSpinePointer(spineIndex);
      if (page === -1) {
        functionsForNextRender.current.push(turnToLastPage);
      }
      page = page === -1 ? 0 : page;
      setCurrentPage(page);
      updateProgressToDb(spineIndex, page);
    },
    [preloadImages, turnToLastPage, updateProgressToDb]
  );

  const handlePathHref = React.useCallback(
    (path) => {
      if (window.getSelection().isCollapsed === false) {
        return;
      }
      if (path.startsWith("http")) {
        return window.open(path, "_blank");
      }
      setCurrentPage(0);
      if (path.startsWith("../")) {
        path = path.substring(3);
      } else if (path.startsWith("/")) {
        path = path.substring(1);
      }
      if (path.indexOf("#") !== -1) {
        setLinkFragment(path.substring(path.indexOf("#") + 1));
        path = path.substring(0, path.indexOf("#"));
      }
      goToAndPreloadImages(hrefSpineMap.current[path]);
    },
    [goToAndPreloadImages]
  );

  const handleOnKeyDown = React.useCallback(
    (event) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
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
    styleElement.innerHTML = `#content *, #previous-content * {\n${userFormattingStyle}\n}`;
    document.head.insertAdjacentElement("beforeend", styleElement);
  };

  const handleSetFormatting = (newFormatting) => {
    const turnedOffNav =
      (formatting.showPageNavigator &&
        newFormatting.showPageNavigator === false) ||
      (formatting.showSpineNavigator &&
        newFormatting.showSpineNavigator === false);
    const turnedOnNav =
      (formatting.showPageNavigator === false &&
        newFormatting.showPageNavigator) ||
      (formatting.showSpineNavigator === false &&
        newFormatting.showSpineNavigator);
    if (turnedOffNav) {
      setDialogContentHeight((prev) => prev + pageNavigateHeight);
    } else if (turnedOnNav) {
      setDialogContentHeight((prev) => prev - pageNavigateHeight);
    }
    updateFormattingOnDB(newFormatting);
    setFormatting(newFormatting);
    putFormattingStyleElement(newFormatting);
  };

  const updateWindowSize = () => {
    setWindowWidth(window.innerWidth);
    setDialogContentHeight(getDialogContentHeight());
  };

  const handleClearObjectURLs = () => {
    for (const url of Object.values(loadedImageURLs)) {
      URL.revokeObjectURL(url);
    }
    setLoadedImageURLs({});
  };

  // on load
  React.useEffect(() => {
    for (const [key, value] of Object.entries(epubObject.css)) {
      const styleElement = document.createElement("style");
      styleElement.id = `epub-css-${key}`;
      styleElement.innerHTML = `#content, #previous-content {\n${value}\n}`;
      document.head.insertAdjacentElement("beforeend", styleElement);
      epubStyleIds.current.push(styleElement.id);
    }
    putFormattingStyleElement();
    setSpinePointer((prev) => {
      const startIndex = prev ?? 0;
      preloadImages(startIndex);
      return startIndex;
    });
    functionsForNextRender.current.push(() => {
      setCurrentPage(
        Math.floor(getCurrentTotalPages() * epubObject.progress.part)
      );
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
        id="appBar"
        variant="outlined"
        elevation={0}
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
          sx={{ minHeight: `${appBarHeight}px`, height: `${appBarHeight}px` }}
          variant="dense"
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
            {greaterThanSmall ? (
              <Stack spacing={-0.5}>
                <Typography variant="subtitle2" noWrap>
                  {epubObject.metadata.title}
                </Typography>
                <Typography variant="subtitle1" noWrap>
                  {spinePointer !== null
                    ? spine.current[spinePointer].label
                    : null}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
          <Stack direction={"row"} spacing={2}>
            {searchFocused ? (
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
                      <Typography variant="caption">{`Part ${
                        option.chapterPartNumber
                      } Page ${option.page + 1}`}</Typography>
                      <span>
                        <span style={{ color: "gray" }}>
                          {option.previewStart}
                        </span>
                        {option.needle}
                        <span style={{ color: "gray" }}>
                          {option.previewEnd}
                        </span>
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
                    autoFocus
                    placeholder="Search"
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
            ) : (
              <>
                <Tooltip title="Search">
                  <IconButton onClick={handleSearchIconClick}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
                <TableOfContents
                  toc={epubObject.toc}
                  handlePathHref={handlePathHref}
                />
                <ReaderFormat
                  formatting={formatting}
                  setFormatting={handleSetFormatting}
                  useGlobalFormatting={useGlobalFormatting}
                  setUseGlobalFormatting={setUseGlobalFormattingHelper}
                />
              </>
            )}
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
        <Stack
          sx={{
            overflow: "hidden",
            ...(formatting.pageColor === "Original"
              ? {}
              : { backgroundColor: formatting.pageColor }),
          }}
        >
          <Stack>
            {formatting.showPageNavigator ? (
              <Stack
                sx={{
                  height: `${pageNavigateHeight}px`,
                  overflow: "hidden",
                }}
                direction={"row"}
                spacing={0.3}
              >
                {arrayForPreviousChapterNavigator.map((index) => (
                  <Tooltip key={index} title={`Part ${index + 1}`} arrow>
                    <Box
                      onClick={() => {
                        goToAndPreloadImages(
                          spinePointer -
                            (spine.current[spinePointer].backCount - index),
                          -1
                        );
                      }}
                      sx={{
                        backgroundColor: `${theme.palette.primary.dark}`,
                        opacity: theme.palette.mode === "light" ? 0.4 : 0.2,
                        cursor: "pointer",
                        width: `${getChapterPartWidthInNav(
                          index,
                          "previous"
                        )}%`,
                        borderRadius: "5px",
                        position: "relative",
                        top: 3,
                      }}
                    />
                  </Tooltip>
                ))}
                <Stack
                  sx={{ width: `${getChapterPartWidthInNav(spinePointer)}%` }}
                  spacing={0}
                  direction={"row"}
                >
                  {arrayForPageNavigator.map((index) => (
                    <Tooltip key={index} title={`Pg ${index + 1}`} arrow>
                      <Box
                        onClick={() => setCurrentPage(index)}
                        sx={{
                          backgroundColor: `${
                            currentPage <= index
                              ? currentPage === index
                                ? theme.palette.secondary.main
                                : theme.palette.text.secondary
                              : theme.palette.primary.dark
                          }`,
                          opacity: theme.palette.mode === "light" ? 0.5 : 0.3,
                          cursor: "pointer",
                          width: "100%",
                          borderRadius: "5px",
                          marginBottom: "-3px",
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
                {arrayForNextChapterNavigator.map((index) => (
                  <Tooltip
                    key={index}
                    title={`Part ${
                      spine.current[spinePointer].backCount +
                      spine.current[spinePointer].frontCount +
                      1 -
                      (spine.current[spinePointer].frontCount - index) +
                      1
                    }`}
                    arrow
                  >
                    <Box
                      onClick={() => {
                        goToAndPreloadImages(spinePointer + (index + 1));
                      }}
                      sx={{
                        backgroundColor: `${theme.palette.text.disabled}`,
                        opacity: theme.palette.mode === "light" ? 0.5 : 0.3,
                        cursor: "pointer",
                        width: `${getChapterPartWidthInNav(index, "next")}%`,
                        borderRadius: "5px",
                        position: "relative",
                        top: 3,
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            ) : null}
            <Stack
              direction="row"
              alignItems={"center"}
              justifyContent={"center"}
              sx={{ height: "100%" }}
              spacing={1}
            >
              <Box
                sx={{
                  width: "100%",
                  height: dialogContentHeight,
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
                    maskImage:
                      "linear-gradient(to right, black 50%, transparent)",
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
                  height: dialogContentHeight,
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
                    maskImage:
                      "linear-gradient(to left, black 50%, transparent)",
                    justifyContent: "flex-end",
                  }}
                  disableRipple={!theme.transitions.reduceMotion}
                />
              </Box>
            </Stack>
            {formatting.showSpineNavigator ? (
              <Stack
                justifyContent="center"
                sx={{
                  height: `${spineNavigateHeight}px`,
                }}
                direction={"row"}
              >
                {arrayForSpineNavigator.map((obj) => (
                  <Tooltip key={obj.label} title={obj.label} arrow>
                    <Box
                      onClick={() =>
                        goToAndPreloadImages(
                          obj.spineStartIndex ?? spinePointer
                        )
                      }
                      sx={{
                        backgroundColor: `${
                          spinePointer >= obj.spineStartIndex
                            ? theme.palette.text.primary
                            : theme.palette.text.disabled
                        }`,
                        opacity: theme.palette.mode === "light" ? 0.5 : 0.2,
                        cursor: "pointer",
                        width: "100%",
                        borderRadius: "5px",
                        marginBottom: `-3px`,
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            ) : null}
            <Tooltip title={"Words Seen"} arrow>
              <Typography
                sx={{
                  position: "absolute",
                  bottom: `${spineNavigateHeight}px`,
                  right: "3px",
                }}
              >
                {Math.ceil(
                  (((currentContentTotalWords / totalPagesForNavigator) *
                    (currentPage + 1) +
                    totalOnGoingWords) /
                    bookTotalWords) *
                    100
                )}
                %
              </Typography>
            </Tooltip>
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
          <Box
            id="preload-photo-bucket"
            sx={{ visibility: "hidden", position: "relative" }}
          >
            {Object.values(loadedImageURLs).map((url) => {
              return (
                <Box
                  key={url}
                  component={"img"}
                  sx={{ position: "absolute" }}
                  src={url}
                />
              );
            })}
          </Box>
        </Stack>
      )}
      <Annotator
        entryId={entryId}
        memos={epubObject.memos}
        notes={epubObject.notes}
      />
    </Dialog>
  );
};

EpubReader.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  epubObject: PropTypes.object.isRequired,
  entryId: PropTypes.string.isRequired,
};
