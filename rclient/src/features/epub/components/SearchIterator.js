import React from "react";
import PropTypes from "prop-types";
import { IconButton, Paper, Slide, Stack, Typography } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  clearTemporaryMarks,
  handleInjectingMarkToEpubNodes,
  waitForElement,
} from "../domUtils";
import { getNewId } from "../../../api/IndexedDB/common";
import { EpubContext } from "./context/EpubState";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";

export const SearchIterator = ({
  setProgressWithoutAddingHistory,
  setForceFocus,
}) => {
  const {
    searchV2SearchResults,
    searchV2CurrentSearchSelection,
    setSearchV2CurrentSearchSelection,
  } = React.useContext(EpubContext);
  const searchResults = searchV2SearchResults;
  const currentSearchSelection = searchV2CurrentSearchSelection;
  const setCurrentSearchSelection = setSearchV2CurrentSearchSelection;
  const { chapterResultsIndex, searchResultIndex } =
    currentSearchSelection ?? {};
  const chapterLabel = searchResults?.[chapterResultsIndex]?.chapterLabel;
  const width = 300;
  const screenWidth = window.innerWidth;
  const middle = (screenWidth - width) / 2;
  const onFirstResult = chapterResultsIndex === 0 && searchResultIndex === 0;
  const onLastResult =
    chapterResultsIndex === searchResults.length - 1 &&
    searchResultIndex ===
      searchResults?.[chapterResultsIndex]?.searchResults?.length - 1;
  const [show, setShow] = React.useState(false);
  const showRef = React.useRef(false);
  const hideTimeoutId = React.useRef(null);
  const showHeight = 250;
  const peekHeight = 12;
  const needle = searchResults?.[0]?.searchResults?.[0]?.needle ?? "";

  const handleClose = () => {
    setSearchV2CurrentSearchSelection(null);
  };

  const handleGoToSearchResult = (chapterResultsIndex, searchResultIndex) => {
    clearTimeout(hideTimeoutId.current);
    clearTemporaryMarks();
    const searchResult =
      searchResults[chapterResultsIndex].searchResults[searchResultIndex];
    setCurrentSearchSelection({
      chapterResultsIndex,
      searchResultIndex,
    });
    setProgressWithoutAddingHistory(searchResult.spineIndex, 0);
    waitForElement(`[nodeid='${searchResult.startContainerId}']`).then(() => {
      const range = searchResult;
      range.startContainer = document.querySelector(
        `[nodeId="${range.startContainerId}"]`
      );
      range.endContainer = document.querySelector(
        `[nodeId="${range.endContainerId}"]`
      );
      handleInjectingMarkToEpubNodes(
        document,
        null,
        range,
        "",
        "temporary-mark"
      );
      waitForElement(".temporary-mark").then((element) => {
        element.id = getNewId();
        const forceFocus = {
          type: "element",
          attributeName: "id",
          attributeValue: element.id,
        };
        setForceFocus(forceFocus);
      });
    });
  };

  const handleIterateNext = () => {
    let newSearchResultIndex = searchResultIndex + 1;
    let newChapterResultsIndex = chapterResultsIndex;
    if (
      newSearchResultIndex ===
      searchResults[chapterResultsIndex].searchResults.length
    ) {
      newSearchResultIndex = 0;
      newChapterResultsIndex += 1;
    }
    if (newChapterResultsIndex === searchResults.length) {
      return;
    }
    handleGoToSearchResult(newChapterResultsIndex, newSearchResultIndex);
  };

  const handleIteratePrevious = () => {
    let newSearchResultIndex = searchResultIndex - 1;
    let newChapterResultsIndex = chapterResultsIndex;
    if (newSearchResultIndex === -1) {
      newChapterResultsIndex -= 1;
      newSearchResultIndex =
        searchResults[newChapterResultsIndex]?.searchResults?.length - 1;
    }
    if (newChapterResultsIndex < 0) {
      return;
    }
    handleGoToSearchResult(newChapterResultsIndex, newSearchResultIndex);
  };

  const handleGoToCurrentSearchResult = () => {
    handleGoToSearchResult(chapterResultsIndex, searchResultIndex);
  };

  const handleSetShow = (value) => {
    setShow(value);
    showRef.current = value;
  };

  const handleTouchEnd = (event) => {
    if (event.changedTouches.length > 1) {
      return;
    }
    const keepShowHeight = showHeight;
    const selectionCollapsed = window.getSelection()?.isCollapsed;
    const touchY = event.changedTouches[0].clientY;
    if (showRef.current && touchY < window.innerHeight - keepShowHeight) {
      handleSetShow(false);
    } else if (
      !showRef.current &&
      selectionCollapsed &&
      touchY >= window.innerHeight - keepShowHeight
    ) {
      handleSetShow(true);
    }
  };

  const handleMouseMove = (event) => {
    const keepShowHeight = showHeight;
    const keepShow = event.clientY >= window.innerHeight - keepShowHeight;
    const showAtY = window.innerHeight - peekHeight;
    const inYRange = event.clientY >= showAtY;
    if (!showRef.current && inYRange) {
      clearTimeout(hideTimeoutId.current);
      handleSetShow(true);
    } else if (showRef.current && !keepShow) {
      handleSetShow(false);
    } else if (showRef.current && keepShow) {
      clearTimeout(hideTimeoutId.current);
      hideTimeoutId.current = setTimeout(() => {
        handleSetShow(false);
      }, 2000);
    }
  };

  React.useEffect(() => {
    const epubBody = document.getElementById("epub-body");
    const dialogContainer = document.getElementsByClassName(
      "MuiDialog-container"
    )[0];
    const dialogRole = dialogContainer.firstChild;
    dialogRole.style.overflow = "hidden";
    epubBody.addEventListener("touchend", handleTouchEnd);
    dialogContainer.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(hideTimeoutId.current);
      epubBody.removeEventListener("touchend", handleTouchEnd);
      dialogContainer.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <Paper
        sx={{
          position: "absolute",
          bottom: 0,
          right: 20,
          width,
          zIndex: 1,
          height: peekHeight,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          display: show || currentSearchSelection === null ? "none" : "",
        }}
      />
      <Slide in={currentSearchSelection && show} direction="up">
        <Paper
          id={"search-iterator"}
          sx={{
            position: "absolute",
            bottom: 10,
            right: 20,
            width,
            padding: 1,
            zIndex: 1,
          }}
        >
          <Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography color="gray" variant="h6">
                Search Results
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography noWrap textAlign="start" color="gray" variant="h6">
              {`"${needle}"`}
            </Typography>
            <Stack justifyContent={"center"}>
              <Typography textAlign="center">{chapterLabel}</Typography>
            </Stack>
            <Stack direction={"row"} justifyContent={"space-between"}>
              <IconButton
                disabled={onFirstResult}
                onClick={handleIteratePrevious}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <Stack direction={"row"} alignItems={"center"} spacing={1}>
                <Typography variant="subtitle1">
                  {(searchResultIndex ?? 0) + 1}
                </Typography>
                <Typography variant="subtitle1">/</Typography>
                <Typography variant="subtitle1">
                  {searchResults?.[chapterResultsIndex]?.searchResults?.length}
                </Typography>
                <IconButton onClick={handleGoToCurrentSearchResult}>
                  <MyLocationIcon />
                </IconButton>
              </Stack>
              <IconButton disabled={onLastResult} onClick={handleIterateNext}>
                <NavigateNextIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
      </Slide>
    </>
  );
};

SearchIterator.propTypes = {
  setProgressWithoutAddingHistory: PropTypes.func.isRequired,
  setForceFocus: PropTypes.func.isRequired,
};
