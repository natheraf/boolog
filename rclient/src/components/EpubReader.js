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
  getEpubData,
  putEpubData,
  updateEpubDataInDotNotation,
} from "../api/IndexedDB/epubData";
import { AlertsContext } from "../context/Alerts";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PropTypes from "prop-types";
import { TableOfContents } from "../features/epub/components/TableOfContents";
import { Annotator } from "../features/epub/components/Annotator";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { getEpubValueFromPath } from "../features/epub/epubUtils";
import { AnnotationViewer } from "../features/epub/components/AnnotationViewer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  deleteNodesAndLiftChildren,
  handleInjectingMarkToEpubNodes,
} from "../features/epub/domUtils";
import { addListener } from "../features/listenerManager";
import {
  DialogSlideUpTransition,
  CircularProgressWithLabel,
} from "../features/CustomComponents";
import { standardFormatting } from "../api/Local";

let firstTouchX = null;
let firstTouchY = null;

let spineIndexTracker = 0;
let pageTracker = 0;

let imagesInMemory = new Set();

export const EpubReader = ({ open, setOpen, epubObject, entryId }) => {
  const theme = useTheme();
  const opacityOfSideElements = 0.4;
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const addAlert = React.useContext(AlertsContext).addAlert;

  const contentElementRef = React.useRef(null);

  const [formatting, setFormatting] = React.useState(
    epubObject.formatting.value
  );
  const [useGlobalFormatting, setUseGlobalFormatting] = React.useState(
    epubObject.formatting.useGlobalFormatting
  );
  const [useStandardFormatting, setUseStandardFormatting] = React.useState(
    epubObject.formatting.useStandardFormatting
  );

  const backgroundColors =
    useStandardFormatting || formatting.pageColor === "Original"
      ? theme.palette.background.paper
      : formatting.pageColor;

  const spine = React.useRef(epubObject.spine);
  const hrefSpineMap = React.useRef(epubObject.spineIndexMap);
  const images = React.useRef(epubObject.images);
  const chapterMeta = React.useRef(epubObject.chapterMeta);
  const notes = React.useRef(epubObject.notes);

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
  const highlightBorderSafety = 45;
  const [windowWidth, setWindowWidth] = React.useState(
    window.innerWidth - highlightBorderSafety
  );
  const getDialogContentHeight = (paramFormatting = formatting) =>
    window.innerHeight -
    leftOverHeight +
    (!paramFormatting.showPageNavigator + !paramFormatting.showSpineNavigator) *
      leftOverNavHeight;
  const [dialogContentHeight, setDialogContentHeight] = React.useState(
    getDialogContentHeight
  );
  const pageHeight = React.useMemo(
    () => dialogContentHeight - formatting.pageHeightMargins,
    [dialogContentHeight, formatting.pageHeightMargins]
  );
  const pageWidth = React.useMemo(() => {
    if (formatting.pageWidth > windowWidth) {
      setFormatting((prev) => ({ ...prev, pageWidth: windowWidth }));
    }
    return formatting.pageWidth;
  }, [formatting.pageWidth, windowWidth]);

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
  const functionsWhenImagesInMemory = React.useRef([]);

  const [searchFocused, setSearchFocused] = React.useState(false);

  const timeOutToSetProgress = React.useRef(null);

  const [annotatorAnchorEl, setAnnotatorAnchorEl] = React.useState(null);

  const [previousSpineIndexAndPage, setPreviousSpineIndexAndPage] =
    React.useState(null);

  const setLocationAsPrevious = () => {
    setPreviousSpineIndexAndPage({
      spineIndex: spineIndexTracker,
      page: pageTracker,
    });
  };

  const goBack = () => {
    setSpinePointer(previousSpineIndexAndPage?.spineIndex ?? spinePointer);
    setCurrentPage(previousSpineIndexAndPage?.page ?? currentPage);
    setLocationAsPrevious();
    spineIndexTracker = previousSpineIndexAndPage?.spineIndex ?? spinePointer;
    pageTracker = previousSpineIndexAndPage?.page ?? currentPage;
  };

  const goToClassName = (name) => {
    if (document.getElementsByClassName(name).length > 0) {
      const content = document
        .getElementById("content")
        .getBoundingClientRect();
      const fragment = document
        .getElementsByClassName(name)[0]
        .getBoundingClientRect();
      const pageDelta = Math.floor(
        (Math.floor(fragment.left) - Math.floor(content.left)) /
          Math.floor(pageWidth + columnGap)
      );
      pageTracker = pageDelta;
      setCurrentPage(pageDelta);
    }
  };

  const addFunctionsAfterRender = (fn, runAtRenderNumber) => {
    while (functionsForNextRender.current.length < runAtRenderNumber) {
      functionsForNextRender.current.push([]);
    }
    functionsForNextRender.current[runAtRenderNumber - 1].push(fn);
  };

  const goToNote = (spineIndex, noteId) => {
    goToAndPreloadImages(spineIndex);
    if (visitedSpineIndexes.current.has(spineIndex)) {
      addFunctionsAfterRender(() => {
        setTimeout(() => goToClassName(noteId), 0);
      }, 1);
    } else {
      functionsWhenImagesInMemory.current.push(() => goToClassName(noteId));
    }
  };

  const handleMarkHighlightOnClick = (mark) => {
    setAnnotatorAnchorEl(mark);
  };

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

  const updateFormattingOnDB = (value, newUseGlobalFormatting) => {
    if (newUseGlobalFormatting) {
      putEpubData({ key: "epubGlobalFormatting", formatting: value }, true);
    }
    updateEpubDataInDotNotation({
      key: entryId,
      formatting: {
        useGlobalFormatting: newUseGlobalFormatting,
        useStandardFormatting,
        value,
      },
    });
  };

  const setUseStandardFormattingHelper = (newValue) => {
    if (newValue) {
      setDialogContentHeight(getDialogContentHeight(standardFormatting));
      putFormattingStyleElement(standardFormatting);
    } else {
      setDialogContentHeight(getDialogContentHeight());
      handleSetFormatting(formatting);
    }
    setUseStandardFormatting(newValue);
    updateEpubDataInDotNotation({
      key: entryId,
      formatting: {
        useGlobalFormatting,
        useStandardFormatting: newValue,
        value: formatting,
      },
    });
  };

  const setUseGlobalFormattingHelper = (newValue) => {
    if (newValue) {
      getEpubData("epubGlobalFormatting").then((res) => {
        handleSetFormatting(res.formatting, newValue);
      });
    } else {
      updateEpubDataInDotNotation({
        key: entryId,
        formatting: {
          useGlobalFormatting: newValue,
          useStandardFormatting,
          value: formatting,
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
    clearTemporaryMarks();
    goToAndPreloadImages(value.spineIndex, value.page);
    setSelectedSearchResult(value);
    handleSearchOnBlur();
  };

  const goToLinkFragment = React.useCallback(
    (linkFragment) => {
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
        pageTracker = pageDelta;
        setCurrentPage(pageDelta);
      }
    },
    [pageWidth]
  );

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
          addFunctionsAfterRender(() => {
            setTimeout(() => goToLinkFragment(markId), 0);
          }, 1);
          functionsWhenImagesInMemory.current.push(() =>
            goToLinkFragment(markId)
          );
        }
        break;
      }
      setSelectedSearchResult(null);
    }
  }, [getXPathSearchExpression, goToLinkFragment, selectedSearchResult]);

  const clearTemporaryMarks = () => {
    if (searchResultElementClone.current !== null) {
      searchResultElementClone.current.parentElement.replaceChild(
        searchResultElement.current,
        searchResultElementClone.current
      );
      searchResultElement.current = null;
      searchResultElementClone.current = null;
    }
    if (document.getElementsByClassName("temporary-mark").length > 0) {
      deleteNodesAndLiftChildren(
        document.getElementsByClassName("temporary-mark")
      );
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
          updateEpubDataInDotNotation({
            key: entryId,
            progress: {
              spine: newSpineIndex ?? spinePointer,
              part: (newCurrentPage ?? currentPage) / getCurrentTotalPages(),
            },
          }),
        500
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
        pageTracker = totalPages - 1;
        setCurrentPage(totalPages - 1);
      }
    }
  }, [currentPage, formatting, pageWidth]);

  /**
   * handles page shrinking out of bounds
   */
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
      if (!visitedSpineIndexes.current.has(spinePointer)) {
        imagesInMemory = new Set();
      }
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
          let url;
          if (tag === "img") {
            const src = node
              .getAttribute("ogsrc")
              ?.substring(node.getAttribute("ogsrc").startsWith("../") * 3);
            url =
              loadedImages[src] ??
              loadedImageURLs[src] ??
              URL.createObjectURL(getEpubValueFromPath(images.current, src));
            node.src = url;
            loadedImages[src] = url;
            if (["DIV", "SECTION"].includes(node.parentElement.tagName)) {
              node.style.display = "block";
            }
            node.style.objectFit = "scale-down";
            node.style.margin = "auto";
          } else if (tag === "image") {
            let src = null;
            for (const key of ["xlink:href", "oghref", "ogsrc"]) {
              if (node.getAttribute(key) !== null) {
                src = node.getAttribute(key);
              }
            }
            src = src?.substring(src.startsWith("../") * 3);
            url =
              loadedImages[src] ??
              loadedImageURLs[src] ??
              URL.createObjectURL(getEpubValueFromPath(images.current, src));
            loadedImages[src] = url;
            node.setAttribute("href", url);
            node.style.height = "100%";
            node.style.width = "";
          }
          if (index === spinePointer) {
            imagesInMemory.add(url);
          }
        }
        spine.current[index].element = page.documentElement.outerHTML;
      }
      setLoadedImageURLs((prev) => ({ ...prev, ...loadedImages }));
    },
    [loadedImageURLs]
  );

  const handleClose = () => {
    setOpen(false);
  };

  /**
   * add event listener to epub anchors and create object urls for images.current
   * if too slow, look into adding id to elements, storing those ids in processEpub, then referencing them here so we can access elements with getElementById faster
   */
  React.useEffect(() => {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      if (mutationList.some((mutation) => mutation.target.id === "content")) {
        document
          .getElementById("content")
          ?.querySelectorAll("a[linkto]")
          .forEach(async (node) => {
            const tag = node.tagName.toLowerCase();
            if (tag === "a" && node.getAttribute("linkto") !== "null") {
              node.style.cursor = "pointer";
              node.addEventListener("click", () => {
                handlePathHref(node.getAttribute("linkto"));
              });
            }
          });

        const spineIndexNotes = notes.current[spineIndexTracker] ?? [];
        for (const [noteId, entry] of Object.entries(spineIndexNotes)) {
          const selectedRange = structuredClone(entry.selectedRangeIndexed);
          selectedRange.startContainer = document.querySelector(
            `[nodeId="${selectedRange.startContainerId}"]`
          );
          selectedRange.endContainer = document.querySelector(
            `[nodeId="${selectedRange.endContainerId}"]`
          );
          handleInjectingMarkToEpubNodes(
            document,
            noteId,
            selectedRange,
            entry.highlightColor,
            "mark"
          );
          const marks = document.getElementsByClassName(noteId);
          const markOnClick = (noteId) => (event) => {
            event.stopPropagation();
            const marks = document.getElementsByClassName(noteId);
            let start = 0;
            while (marks[start].textContent.length === 0) {
              start += 1;
            }
            let end = marks.length - 1;
            while (marks[end].textContent.length === 0) {
              end -= 1;
            }
            let markToAnchor = marks[end];
            if (
              marks[start].getBoundingClientRect().top >
              Math.floor(window.innerHeight / 2)
            ) {
              markToAnchor = marks[start];
            }
            if (
              window.getSelection().rangeCount === 1 &&
              ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) ===
                false
            ) {
              handleMarkHighlightOnClick(markToAnchor);
            }
          };
          for (const mark of marks) {
            addListener(mark, "click", markOnClick(noteId));
          }
        }
      }
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, []);

  /**
   * observes src attribute changes to help with flagging loaded images so we turn to the correct page
   */
  React.useEffect(() => {
    const config = {
      attributes: true,
      attributeFilter: ["src"],
      subtree: true,
    };
    const observer = new MutationObserver((mutationList, observer) => {
      for (const mutation of mutationList) {
        imagesInMemory.delete(mutation.target.src);
      }
      if (imagesInMemory.size === 0) {
        setTimeout(() => {
          functionsWhenImagesInMemory.current.forEach((fn) => fn());
          functionsWhenImagesInMemory.current = [];
        }, 10);
      }
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, []);

  /**
   * resizes images
   */
  React.useEffect(() => {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      if (functionsForNextRender.current.length > 0) {
        functionsForNextRender.current.shift().forEach((fn) => fn());
      }
      setTotalPagesForNavigator(getCurrentTotalPages());
      document
        .getElementById("content")
        ?.querySelectorAll("img, svg, image")
        .forEach((element) => {
          element.style.maxHeight = `${pageHeight}px`;
          element.style.maxWidth = `${pageWidth}px`;
          if (element.tagName.toLowerCase() === "svg") {
            element.setAttribute(
              "viewBox",
              `0, 0, ${pageWidth}, ${pageHeight}`
            );
          }
          if (element.tagName.toLowerCase() === "image") {
            element.setAttribute("width", `${pageWidth}px`);
            element.removeAttribute("height");
          }
        });
    });
    observer.observe(document.body, config);
    return () => observer.disconnect();
  }, [getCurrentTotalPages, pageHeight, pageWidth]);

  const handleNextPage = React.useCallback(() => {
    if (
      document
        .getElementById("annotator-menu")
        ?.contains(document.activeElement)
    ) {
      return;
    }
    clearTemporaryMarks();
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
      pageTracker = 0;
      setCurrentPage(0);
      setSpinePointer((prev) => {
        spineIndexTracker = prev + 1;
        preloadImages(prev + 1);
        const value = Math.min(spine.current.length - 1, prev + 1);
        updateProgressToDb(value, 0);
        return value;
      });
    } else {
      setCurrentPage((prev) => {
        pageTracker = prev + 1;
        updateProgressToDb(null, prev + 1);
        return prev + 1;
      });
    }
  }, [pageWidth, formatting, currentPage, preloadImages, updateProgressToDb]);

  const handlePreviousPage = React.useCallback(() => {
    if (
      document
        .getElementById("annotator-menu")
        ?.contains(document.activeElement)
    ) {
      return;
    }
    clearTemporaryMarks();
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
      pageTracker = totalPages - 1;
      setCurrentPage(totalPages - 1);
      setSpinePointer((prev) => {
        spineIndexTracker = prev - 1;
        preloadImages(prev - 1);
        const value = Math.max(0, prev - 1);
        updateProgressToDb(value, totalPages - 1);
        return value;
      });
    } else {
      setCurrentPage((prev) => {
        pageTracker = prev - 1;
        updateProgressToDb(null, prev - 1);
        return prev - 1;
      });
    }
  }, [pageWidth, formatting, currentPage, preloadImages, updateProgressToDb]);

  const handleTouchStart = (event) => {
    if (document.getElementById("reader-body").contains(event.target)) {
      firstTouchX = event.touches[0].clientX;
      firstTouchY = event.touches[0].clientY;
    }
  };

  const handleTouchMove = React.useCallback(
    (event) => {
      if (firstTouchX === null || firstTouchY === null) {
        return;
      }
      const xUp = event.touches[0].clientX;
      const yUp = event.touches[0].clientY;

      const xDiff = firstTouchX - xUp;
      const yDiff = firstTouchY - yUp;

      if (
        Math.abs(xDiff) > Math.abs(yDiff) &&
        window.getSelection()?.isCollapsed
      ) {
        if (xDiff > 5) {
          handleNextPage();
        } else if (xDiff < -5) {
          handlePreviousPage();
        }
      }
      firstTouchX = null;
      firstTouchY = null;
    },
    [handleNextPage, handlePreviousPage]
  );

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
    pageTracker = totalPages - 1;
    setCurrentPage(totalPages - 1);
  }, [formatting, pageWidth]);

  const goToAndPreloadImages = React.useCallback(
    (spineIndex, page = 0) => {
      setLocationAsPrevious();
      preloadImages(spineIndex);
      spineIndexTracker = spineIndex;
      setSpinePointer(spineIndex);
      if (page === -1) {
        addFunctionsAfterRender(turnToLastPage, 1);
      }
      page = page === -1 ? 0 : page;
      pageTracker = page;
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
      if (path.startsWith("../")) {
        path = path.substring(3);
      } else if (path.startsWith("/")) {
        path = path.substring(1);
      }
      let linkFragment;
      if (path.indexOf("#") !== -1) {
        linkFragment = path.substring(path.indexOf("#") + 1);
        functionsWhenImagesInMemory.current.push(() =>
          goToLinkFragment(linkFragment)
        );
        if (path.indexOf("#") === 0) {
          return goToLinkFragment(linkFragment);
        }
      }
      const spineIndex = getEpubValueFromPath(
        hrefSpineMap.current,
        path.indexOf("#") === -1 ? path : path.substring(0, path.indexOf("#"))
      );
      if (typeof spineIndex === "number") {
        setLocationAsPrevious();
        if (linkFragment && spineIndex === spineIndexTracker) {
          return goToLinkFragment(linkFragment);
        } else if (
          linkFragment &&
          visitedSpineIndexes.current.has(spineIndex)
        ) {
          addFunctionsAfterRender(() => {
            setTimeout(() => goToLinkFragment(linkFragment), 0);
          }, 1);
        }
        addFunctionsAfterRender(() => (pageTracker = 0), 1);
        goToAndPreloadImages(spineIndex);
      }
    },
    [goToAndPreloadImages, goToLinkFragment]
  );

  const handleOnKeyDown = React.useCallback(
    (event) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        return;
      }
      if (event.key === "ArrowLeft") {
        handlePreviousPage();
      } else if (["ArrowRight", " ", "d"].includes(event.key)) {
        event.preventDefault();
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
    styleElement.innerHTML = `#content *, #previous-content * {\n${userFormattingStyle}\n}`;
    document.head.insertAdjacentElement("beforeend", styleElement);
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
    styleElement.innerHTML = `#content *, #previous-content * {\n${highlightStyles}\n}`;
    document.head.insertAdjacentElement("beforeend", styleElement);
  };

  const handleSetFormatting = (
    newFormatting,
    newUseGlobalFormatting = useGlobalFormatting
  ) => {
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
    updateFormattingOnDB(newFormatting, newUseGlobalFormatting);
    setFormatting(newFormatting);
    putFormattingStyleElement(newFormatting);
  };

  const updateWindowSize = () => {
    setWindowWidth(window.innerWidth - highlightBorderSafety);
    setDialogContentHeight(getDialogContentHeight());
  };

  const handleClearObjectURLs = () => {
    for (const url of Object.values(loadedImageURLs)) {
      URL.revokeObjectURL(url);
    }
    setLoadedImageURLs({});
  };

  React.useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchMove]);

  // on load
  React.useEffect(() => {
    for (const [key, value] of Object.entries(epubObject.css)) {
      const styleElement = document.createElement("style");
      styleElement.id = `epub-css-${key}`;
      styleElement.innerHTML = `#content, #previous-content {\n${value}\n}`;
      document.head.insertAdjacentElement("beforeend", styleElement);
      epubStyleIds.current.push(styleElement.id);
    }
    putHighlightStyles();
    if (useStandardFormatting) {
      setDialogContentHeight(getDialogContentHeight(standardFormatting));
      putFormattingStyleElement(standardFormatting);
    } else {
      putFormattingStyleElement();
    }
    setSpinePointer((prev) => {
      const startIndex = prev ?? 0;
      spineIndexTracker = startIndex;
      preloadImages(startIndex);
      if (imagesInMemory.size === 0) {
        const page = Math.floor(
          getCurrentTotalPages() * epubObject.progress.part
        );
        pageTracker = page;
        setCurrentPage(page);
      } else {
        functionsWhenImagesInMemory.current.push(() => {
          const page = Math.floor(
            getCurrentTotalPages() * epubObject.progress.part
          );
          pageTracker = page;
          setCurrentPage(page);
        });
      }
      return startIndex;
    });
    if (
      typeof epubObject.progress.part !== "number" ||
      isNaN(epubObject.progress.part)
    ) {
      epubObject.progress.part = 0;
    }

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
                  {epubObject.metadata.common.title.value}
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
                          ) : (
                            <Tooltip title={"Press Enter to Search"}>
                              <KeyboardReturnIcon
                                fontSize="small"
                                color="success"
                              />
                            </Tooltip>
                          )}
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
              <Stack spacing={1} direction={"row"}>
                {previousSpineIndexAndPage !== null ? (
                  <Tooltip title="Back">
                    <IconButton onClick={goBack}>
                      <ArrowBackIcon />
                    </IconButton>
                  </Tooltip>
                ) : null}
                <Tooltip title="Search">
                  <IconButton onClick={handleSearchIconClick}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
                <AnnotationViewer
                  spine={spine.current}
                  entryId={entryId}
                  clearTemporaryMarks={clearTemporaryMarks}
                  notes={notes.current}
                  memos={epubObject.memos}
                  currentSpineIndex={spinePointer}
                  goToNote={goToNote}
                />
                <TableOfContents
                  toc={epubObject.toc}
                  handlePathHref={handlePathHref}
                  currentSpineIndexLabel={spine.current[spinePointer].label}
                />
                <ReaderFormat
                  formatting={formatting}
                  setFormatting={handleSetFormatting}
                  useGlobalFormatting={useGlobalFormatting}
                  setUseGlobalFormatting={setUseGlobalFormattingHelper}
                  useStandardFormatting={useStandardFormatting}
                  setUseStandardFormatting={setUseStandardFormattingHelper}
                />
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      {spinePointer === null ? (
        "Loading, please wait..."
      ) : (
        <Stack
          sx={{
            overflow: "hidden",
            backgroundColor: backgroundColors,
          }}
        >
          <Stack id="reader-body">
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
                        onClick={() => {
                          pageTracker = index;
                          setCurrentPage(index);
                        }}
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
              overflow="hidden"
            >
              <Box
                onClick={handlePreviousPage}
                sx={{
                  width: "100%",
                  height: dialogContentHeight,
                  position: "relative",
                  zIndex: 1,
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backgroundColor: backgroundColors,
                    justifyContent: "flex-end",
                  }}
                />
                <Divider
                  orientation="vertical"
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    visibility: formatting.showDividers ? "visible" : "hidden",
                    opacity: opacityOfSideElements,
                  }}
                />
                <NavigateBeforeIcon
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    margin: "auto",
                    visibility:
                      formatting.showArrows &&
                      windowWidth - formatting.pageWidth >= 100
                        ? "visible"
                        : "hidden",
                    opacity: opacityOfSideElements,
                  }}
                  htmlColor={"gray"}
                />
              </Box>
              <Box
                sx={{
                  maxWidth: `${pageWidth}px`,
                  minWidth: `${pageWidth}px`,
                  overflow: "visible",
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
                      "something went wrong...<br/> spine.current is missing",
                  }}
                />
              </Box>
              <Box
                onClick={handleNextPage}
                sx={{
                  width: "100%",
                  height: dialogContentHeight,
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backgroundColor: backgroundColors,
                    justifyContent: "flex-end",
                  }}
                />
                <Divider
                  orientation="vertical"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    visibility: formatting.showDividers ? "visible" : "hidden",
                    opacity: opacityOfSideElements,
                  }}
                />
                <NavigateNextIcon
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    margin: "auto",
                    visibility:
                      formatting.showArrows &&
                      windowWidth - formatting.pageWidth >= 100
                        ? "visible"
                        : "hidden",
                    opacity: opacityOfSideElements,
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
                    opacity: opacityOfSideElements,
                    visibility:
                      windowWidth - formatting.pageWidth >= 143
                        ? "visible"
                        : "hidden",
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
                  bottom: `27px`,
                  right: "2px",
                  height: "0px",
                  opacity: 0.3,
                }}
                variant="subtitle2"
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
                  "something went wrong...<br/> spine.current is missing",
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
        notes={notes.current}
        clearTemporaryMarks={clearTemporaryMarks}
        spineIndex={spinePointer}
        anchorEl={annotatorAnchorEl}
        setAnchorEl={setAnnotatorAnchorEl}
        key={annotatorAnchorEl?.getAttribute("nodeid")}
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
