import * as React from "react";
import PropTypes from "prop-types";
import { Box, Slide, Stack } from "@mui/material";
import {
  attachOnClickListenersToLinkElements,
  handleMouseMoveHiderOnTimeout,
  handleShowCursor,
} from "../domUtils";
import { handlePathHref } from "../epubUtils";
import { appBarHeight } from "./HeaderV2";

export const ScrollView = ({
  epubObject,
  spineIndex,
  partProgress,
  forceFocus,
  setForceFocus,
  formatting,
  setProgress,
  setProgressWithoutAddingHistory,
  formatMenuIsOpen,
}) => {
  const epubBody = document.getElementById("epub-body");
  const spine = epubObject.spine;
  const sentinelsHeight = window.innerHeight;
  const spineIndexMap = epubObject.spineIndexMap;
  const highlightBorderSafety = 25;
  const pageWidth = Math.min(
    formatting.pageWidth,
    window.innerWidth - highlightBorderSafety
  );
  const isMouseDown = React.useRef(false);
  const hideCursorTimeoutId = React.useState();

  const scrollToPercent = (percentage) => {
    const epubBody = document.getElementById("epub-body");
    const contentHeight = document
      .getElementById("content")
      .getBoundingClientRect().height;
    const targetScrollTop = contentHeight * percentage;
    const topSentinelExists = spineIndex > 0;
    const includeSentinel =
      targetScrollTop + sentinelsHeight * +topSentinelExists;
    const showABitOfBottomSentinel =
      percentage === 0.999999
        ? includeSentinel - sentinelsHeight * 0.7
        : includeSentinel;
    const showABitOfTopSentinel =
      percentage === 0
        ? includeSentinel - sentinelsHeight * 0.3
        : showABitOfBottomSentinel;
    return epubBody.scroll({
      top: showABitOfTopSentinel,
    });
  };

  const timeOutToSetProgress = React.useRef(null);
  const onScroll = () => {
    clearTimeout(timeOutToSetProgress.current);
    if (isMouseDown.current) {
      return;
    }
    const content = document.getElementById("content");
    const contentRect = content.getBoundingClientRect();
    const epubBodyScrollTop = epubBody.scrollTop;
    const bufferToChangeChapters = sentinelsHeight * 0.05;
    const goPreviousChapter = epubBodyScrollTop <= bufferToChangeChapters;
    const onFirstChapter = spineIndex === 0;
    const goNextChapter =
      contentRect.height +
        sentinelsHeight * (2 - +onFirstChapter) -
        (epubBodyScrollTop + window.innerHeight) <
      bufferToChangeChapters;

    if (
      (goPreviousChapter && spineIndex !== 0) ||
      (goNextChapter && spineIndex !== spine.length - 1)
    ) {
      if (goPreviousChapter) {
        setProgress(spineIndex - 1, 0.999999);
      } else if (goNextChapter) {
        setProgress(spineIndex + 1, 0);
      }
      return;
    }

    timeOutToSetProgress.current = setTimeout(() => {
      const includeAppBarHeight = -contentRect.top + appBarHeight;
      const percentage = includeAppBarHeight / contentRect.height;
      const avoidNegatives = Math.max(0, percentage);
      const avoidOne = Math.min(0.999999, avoidNegatives);
      setProgress(spineIndex, avoidOne);
    }, 500);
  };

  const handleFocusElement = (forceFocus) => {
    const { attributeName, attributeValue } = forceFocus;
    let element = null;
    if (attributeName === "id") {
      element = document.getElementById(attributeValue);
    } else if (attributeName === "class") {
      element = document.getElementsByClassName(attributeName)[0];
    } else {
      element = document.querySelector(
        `[${attributeName}="${attributeValue}"]`
      );
    }
    if (element !== null) {
      const elementRect = element.getBoundingClientRect();
      const contentRect = document
        .getElementById("content")
        .getBoundingClientRect();
      if (
        elementRect.top > contentRect.bottom ||
        elementRect.bottom < contentRect.top
      ) {
        return;
      }
      const elementPositionPercentage =
        (elementRect.top - contentRect.top) / contentRect.height;
      setProgress(spineIndex, elementPositionPercentage);
      scrollToPercent(elementPositionPercentage);
    }
    setForceFocus(null);
  };

  const focusEpubBody = () => {
    epubBody.focus();
  };

  const handleKeyboardChapterJumping = (forward) => {
    const currentPartBackCount = spine[spineIndex]?.backCount ?? 0;
    if (forward) {
      const nextChapterStart =
        spineIndex + (spine[spineIndex]?.frontCount ?? 0) + 1;
      setProgress(nextChapterStart, 0);
    } else if (
      spineIndex > 0 &&
      partProgress === 0 &&
      currentPartBackCount === 0
    ) {
      const previousChapterPartCount = spine[spineIndex - 1]?.backCount ?? 0;
      const previousChapterStart = spineIndex - previousChapterPartCount - 1;
      setProgress(previousChapterStart, 0);
    } else {
      const currentChapterStart = spineIndex - currentPartBackCount;
      setProgress(currentChapterStart, 0);
      setForceFocus({ type: "partProgress" });
    }
  };

  const handlePartJumping = (forward) => {
    if (forward && partProgress === 0.999999) {
      setProgress(spineIndex + 1, 0);
    } else if (forward) {
      setProgress(spineIndex, 0.999999);
      setForceFocus({ type: "partProgress" });
    } else if (partProgress === 0) {
      setProgress(spineIndex - 1, 0.999999);
    } else {
      setProgress(spineIndex, 0);
      setForceFocus({ type: "partProgress" });
    }
  };

  const handleLeftRightArrowDown = (forward) => {
    const deltaPercent = 0.9;
    const delta = window.innerHeight * deltaPercent * (forward ? 1 : -1);
    epubBody.scroll({
      top: epubBody.scrollTop + delta,
      behavior: "smooth",
    });
  };

  const handleOnKeyDown = (event) => {
    if (
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) ||
      ![
        "ArrowUp",
        "PageUp",
        "ArrowLeft",
        "ArrowDown",
        "PageDown",
        "ArrowRight",
      ].includes(event.key)
    ) {
      return;
    }
    handleShowCursor(epubBody, false);
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const forward = ["ArrowDown", "PageDown", "ArrowRight"].includes(event.key);
    const scrollButtonPressed = [
      "ArrowUp",
      "PageUp",
      "ArrowDown",
      "PageDown",
    ].includes(event.key);
    const leftOrRightArrow = ["ArrowLeft", "ArrowRight"].includes(event.key);
    if (isCtrlOrCmd && !scrollButtonPressed) {
      handleKeyboardChapterJumping(forward);
    } else if (isShift && !scrollButtonPressed) {
      handlePartJumping(forward);
    } else if (leftOrRightArrow && !event.repeat) {
      handleLeftRightArrowDown(forward);
    } else {
      focusEpubBody();
    }
  };

  /**
   * Keep progress react state updated when scrolling for history management
   */
  React.useEffect(() => {
    let timeoutId = null;
    let abortController = new AbortController();
    if (formatMenuIsOpen === false) {
      abortController = new AbortController();
      attachOnClickListenersToLinkElements(
        handlePathHref(
          spineIndex,
          spineIndexMap,
          setProgressWithoutAddingHistory,
          setForceFocus
        ),
        abortController.signal
      );
      timeoutId = setTimeout(() => {
        epubBody.addEventListener("scroll", onScroll);
      }, 300);
      document.addEventListener("keydown", handleOnKeyDown);
    }
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeOutToSetProgress.current);
      epubBody.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", handleOnKeyDown);
      abortController.abort();
    };
  }, [partProgress, formatMenuIsOpen]);

  React.useEffect(() => {
    setTimeout(() => {
      // setTimeout executes after images are rendered.
      if (forceFocus?.type === "element") {
        handleFocusElement(forceFocus);
      } else {
        scrollToPercent(partProgress);
      }
      if (forceFocus?.type === "partProgress") {
        setForceFocus(null);
      }
    });
  }, [forceFocus, formatting]);

  const onMouseDown = () => {
    isMouseDown.current = true;
  };
  const onMouseUp = () => {
    isMouseDown.current = false;
    onScroll();
  };
  const handleMouseMove = (event) => {
    handleShowCursor(epubBody, true);
    handleMouseMoveHiderOnTimeout(event, epubBody, hideCursorTimeoutId);
  };

  React.useEffect(() => {
    focusEpubBody();
    epubBody.addEventListener("mousedown", onMouseDown);
    epubBody.addEventListener("mouseup", onMouseUp);
    epubBody.addEventListener("mousemove", handleMouseMove);
    return () => {
      epubBody.removeEventListener("mousedown", onMouseDown);
      epubBody.removeEventListener("mouseup", onMouseUp);
      epubBody.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Stack
      id="scroll-view"
      alignItems={"center"}
      sx={{
        overflow: "hidden",
        backgroundColor: formatting.backgroundColor,
      }}
    >
      {spineIndex > 0 && <Box sx={{ height: sentinelsHeight }} />}
      <Slide
        in={true}
        timeout={200}
        direction={partProgress === 0.999999 ? "down" : "up"}
      >
        <Box
          id="content"
          className="content"
          sx={{
            minWidth: `${pageWidth}px`,
            maxWidth: `${pageWidth}px`,
            minHeight: window.innerHeight,
          }}
          dangerouslySetInnerHTML={{
            __html:
              spine?.[spineIndex ?? -1]?.element ??
              "something went wrong...<br/> spine.current is missing",
          }}
        />
      </Slide>
      {spineIndex < spine.length - 1 && (
        <Box sx={{ height: sentinelsHeight }} />
      )}
    </Stack>
  );
};

ScrollView.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  forceFocus: PropTypes.object,
  setForceFocus: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
  setProgressWithoutAddingHistory: PropTypes.func.isRequired,
  formatMenuIsOpen: PropTypes.bool.isRequired,
};
