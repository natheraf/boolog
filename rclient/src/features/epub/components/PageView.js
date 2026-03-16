import * as React from "react";
import PropTypes from "prop-types";
import { Box, CircularProgress, Fade, Stack } from "@mui/material";
import { SideButtons } from "./SideButtons";
import { attachOnClickListenersToLinkElements } from "../domUtils";
import { handlePathHref } from "../epubUtils";
import { ChapterNavigator } from "./ChapterNavigator";

export const PageView = ({
  epubObject,
  spineIndex,
  partProgress,
  forceFocus,
  setForceFocus,
  formatting,
  setProgress,
  setProgressWithoutAddingHistory,
  autoHide,
}) => {
  const spine = epubObject.spine;
  const spineIndexMap = epubObject.spineIndexMap;
  const columnGap = 1;
  const highlightBorderSafety = 25;
  const pageWidth = Math.min(
    formatting.pageWidth,
    window.innerWidth - highlightBorderSafety
  );

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
      const pageDelta = Math.floor(
        (Math.floor(elementRect.left) - Math.floor(contentRect.left)) /
          Math.floor(contentRect.width + columnGap)
      );
      setCurrentPage(pageDelta);
      setProgress(spineIndex, pageDelta / getTotalPages());
    }
    setForceFocus(null);
  };

  const handleOnKeyDown = (event) => {
    if (
      isLoading ||
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      return;
    }
    if (["ArrowLeft", "PageUp"].includes(event.key)) {
      handlePreviousPage();
    } else if (["ArrowRight", "PageDown"].includes(event.key)) {
      handleNextPage();
    }
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
          setProgressWithoutAddingHistory,
          setForceFocus
        ),
        abortController.signal
      );
      document.addEventListener("keydown", handleOnKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleOnKeyDown);
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
      {formatting.showPageNavigator && !isLoading && (
        <ChapterNavigator
          epubObject={epubObject}
          spineIndex={spineIndex}
          formatting={formatting}
          setProgress={setProgress}
          autoHide={autoHide}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
      <SideButtons
        leftButtonOnClick={handlePreviousPage}
        rightButtonOnClick={handleNextPage}
        formatting={formatting}
      >
        <Box
          sx={{
            height: "100%",
            minWidth: `${pageWidth}px`,
            maxWidth: `${pageWidth}px`,
            overflow: "visible",
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
  setProgress: PropTypes.func.isRequired,
  setProgressWithoutAddingHistory: PropTypes.func.isRequired,
  autoHide: PropTypes.bool.isRequired,
};
