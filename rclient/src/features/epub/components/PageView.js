import * as React from "react";
import PropTypes from "prop-types";
import { Box, CircularProgress, Fade, Stack } from "@mui/material";
import { SideButtons } from "./SideButtons";
import {
  attachOnClickListenersToLinkElements,
  handleMouseMoveHiderOnTimeout,
  handleShowCursor,
} from "../domUtils";
import { handlePathHref } from "../epubUtils";
import { ChapterNavigator } from "./ChapterNavigator";

export const PageView = ({
  epubObject,
  spineIndex,
  partProgress,
  forceFocus,
  setForceFocus,
  formatting,
  displayOptions,
  setProgress,
  setProgressWithoutAddingHistory,
}) => {
  const epubBody = document.getElementById("epub-body");
  const spine = epubObject.spine;
  const spineIndexMap = epubObject.spineIndexMap;
  const columnGap = 1;
  const highlightBorderSafety = 25;
  const pageWidth = Math.min(
    formatting.pageWidth,
    window.innerWidth - highlightBorderSafety
  );
  const firstTouchXRef = React.useRef(null);
  const firstTouchYRef = React.useRef(null);

  const getTotalPages = () =>
    document.getElementById("content")
      ? Math.floor(document.getElementById("content").scrollWidth / pageWidth) +
        +(
          formatting.pagesShown > 1 &&
          (document.getElementById("content").scrollWidth % pageWidth) /
            pageWidth >
            1 / formatting.pagesShown
        )
      : 0;

  const [currentPage, setCurrentPage] = React.useState(() =>
    Math.floor(partProgress * getTotalPages())
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const hideCursorTimeoutId = React.useState();

  const handleNextPage = () => {
    const totalPages = getTotalPages();
    const isLastPage = currentPage + 1 === totalPages;
    if (isLastPage) {
      const newSpineIndex = Math.min(spineIndex + 1, spine.length - 1);
      setProgress(newSpineIndex, 0);
      setCurrentPage(0);
    } else {
      setProgress(spineIndex, (currentPage + 1) / totalPages);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    const totalPages = getTotalPages();
    const isFirstPage = currentPage === 0;
    if (isFirstPage) {
      if (spineIndex > 0) {
        setProgress(spineIndex - 1, 0.999999);
        setCurrentPage(1 << 30);
      }
    } else {
      const newPage = Math.max(0, (currentPage - 1) / totalPages);
      setProgress(spineIndex, newPage);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleFocusElement = (forceFocus) => {
    const { attributeName, attributeValue } = forceFocus;
    let element = null;
    if (attributeName === "id") {
      element = document.getElementById(attributeValue);
    } else if (attributeName === "class") {
      element = document.getElementsByClassName(attributeValue)[0];
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
      const pageDelta = Math.floor(
        (Math.floor(elementRect.left) - Math.floor(contentRect.left)) /
          Math.floor(contentRect.width + columnGap)
      );
      setCurrentPage(pageDelta);
      setProgress(spineIndex, pageDelta / getTotalPages());
    }
    setForceFocus(null);
  };

  const goToLastPage = () => {
    const totalPages = getTotalPages();
    const lastPage = totalPages - 1;
    setProgress(spineIndex, lastPage / totalPages);
    setForceFocus({ type: "partProgress" });
  };

  const onLastPage = () => {
    const totalPages = getTotalPages();
    const isLastPage = currentPage + 1 === totalPages;
    return isLastPage;
  };

  const handlePartJumping = (forward) => {
    if (forward && onLastPage()) {
      setProgress(spineIndex + 1, 0);
    } else if (forward) {
      goToLastPage();
    } else if (currentPage === 0) {
      setProgress(spineIndex - 1, 0.999999);
    } else {
      setProgress(spineIndex, 0);
      setForceFocus({ type: "partProgress" });
    }
  };

  const handleKeyboardChapterJumping = (forward) => {
    const currentPartBackCount = spine[spineIndex]?.backCount ?? 0;
    if (forward) {
      const nextChapterStart =
        spineIndex + (spine[spineIndex]?.frontCount ?? 0) + 1;
      setProgress(nextChapterStart, 0);
    } else if (
      spineIndex > 0 &&
      currentPage === 0 &&
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

  const handleOnKeyDown = (event) => {
    if (
      isLoading ||
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) ||
      !["ArrowLeft", "PageUp", "ArrowRight", "PageDown"].includes(event.key)
    ) {
      return;
    }
    handleShowCursor(epubBody, false);
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const forward = ["PageDown", "ArrowRight"].includes(event.key);
    const scrollButtonPressed = ["PageUp", "PageDown"].includes(event.key);
    if (isCtrlOrCmd && !scrollButtonPressed) {
      handleKeyboardChapterJumping(forward);
    } else if (isShift && !scrollButtonPressed) {
      handlePartJumping(forward);
    } else if (forward) {
      handleNextPage();
    } else if (!isCtrlOrCmd && !isShift) {
      handlePreviousPage();
    }
  };

  const handleWheelDelta = (event) => {
    const scrollUp = event.deltaY < 0;
    if (scrollUp) {
      handlePreviousPage();
    } else {
      handleNextPage();
    }
  };

  const handleMouseMove = (event) => {
    handleShowCursor(epubBody, true);
    handleMouseMoveHiderOnTimeout(event, epubBody, hideCursorTimeoutId);
  };

  const handleTouchStart = (event) => {
    if (
      event.touches[0].pageX < highlightBorderSafety ||
      event.touches[0].pageX > window.innerWidth - highlightBorderSafety
    ) {
      event.preventDefault();
    }
    firstTouchXRef.current = event.touches[0].clientX;
    firstTouchYRef.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event) => {
    if (firstTouchXRef.current === null || firstTouchYRef.current === null) {
      return;
    }
    const x = event.changedTouches[0].clientX;
    const y = event.changedTouches[0].clientY;
    const xDiff = firstTouchXRef.current - x;
    const yDiff = firstTouchYRef.current - y;
    const deltaTrigger = 30;
    if (
      Math.abs(xDiff) > Math.abs(yDiff) &&
      window.getSelection()?.isCollapsed
    ) {
      if (xDiff > deltaTrigger) {
        handleNextPage();
      } else if (xDiff < -deltaTrigger) {
        handlePreviousPage();
      }
    }
    firstTouchXRef.current = null;
    firstTouchYRef.current = null;
  };

  /**
   * keep react state data attached to non-react elements updated
   * 1. for history management: Non-react elements need to refresh their functions attached on their listeners with updated react state.
   * 2. refresh keydown listener with new state
   */
  React.useEffect(() => {
    const abortController = new AbortController();
    if (!isLoading) {
      attachOnClickListenersToLinkElements(
        handlePathHref(
          spineIndex,
          spineIndexMap,
          setProgress,
          setProgressWithoutAddingHistory,
          setForceFocus
        ),
        abortController.signal
      );
      document.addEventListener("keydown", handleOnKeyDown);
      epubBody.addEventListener("wheel", handleWheelDelta);
      epubBody.addEventListener("mousemove", handleMouseMove);
      epubBody.addEventListener("touchstart", handleTouchStart);
      epubBody.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      document.removeEventListener("keydown", handleOnKeyDown);
      epubBody.removeEventListener("wheel", handleWheelDelta);
      epubBody.removeEventListener("mousemove", handleMouseMove);
      epubBody.removeEventListener("touchstart", handleTouchStart);
      epubBody.removeEventListener("touchend", handleTouchEnd);
      abortController.abort();
    };
  }, [isLoading, currentPage]);

  React.useEffect(() => {
    setTimeout(() => {
      // setTimeout executes after images are rendered.
      if (forceFocus?.type === "element") {
        handleFocusElement(forceFocus);
      } else {
        setCurrentPage(Math.floor(partProgress * getTotalPages()));
      }
      if (forceFocus?.type === "partProgress") {
        setForceFocus(null);
      }
      setIsLoading(false);
    });
  }, [forceFocus, formatting]);

  return (
    <>
      {isLoading && (
        <Stack
          sx={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            backgroundColor: formatting.pageColor,
          }}
          alignItems="center"
          justifyContent="center"
        >
          <Fade in={true} timeout={200}>
            <CircularProgress disableShrink />
          </Fade>
        </Stack>
      )}
      {displayOptions.showPageNavigator && !isLoading && (
        <ChapterNavigator
          epubObject={epubObject}
          spineIndex={spineIndex}
          formatting={formatting}
          setProgress={setProgress}
          autoHideHeader={displayOptions.autoHideHeader}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
      <SideButtons
        leftButtonOnClick={handlePreviousPage}
        rightButtonOnClick={handleNextPage}
        formatting={formatting}
        displayOptions={displayOptions}
      >
        <Box
          sx={{
            height: "100%",
            minWidth: `${pageWidth}px`,
            maxWidth: `${pageWidth}px`,
            overflow: "visible",
            paddingTop: `${formatting.pageHeightMargins / 2}px`,
            paddingBottom: `${formatting.pageHeightMargins / 2}px`,
          }}
        >
          <Box
            id="content"
            className="content"
            sx={{
              width: "100%",
              height: "100%",
              columnFill: "balance",
              columnGap: `${columnGap}px`,
              columnWidth: `${
                (pageWidth - columnGap * formatting.pagesShown) /
                formatting.pagesShown
              }px`,
              transform: `translate(-${currentPage * (pageWidth + columnGap)}px);`,
            }}
            dangerouslySetInnerHTML={{
              __html:
                spine?.[spineIndex ?? -1]?.element ??
                "something went wrong...<br/> spine.current is missing",
            }}
          />
        </Box>
      </SideButtons>
    </>
  );
};

PageView.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  forceFocus: PropTypes.object,
  setForceFocus: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  displayOptions: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
  setProgressWithoutAddingHistory: PropTypes.func.isRequired,
};
