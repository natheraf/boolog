import * as React from "react";
import PropTypes from "prop-types";
import { Box, Fade } from "@mui/material";
import { SideButtons } from "./SideButtons";
import {
  attachOnClickListenersToLinkElements,
  waitForElement,
} from "../domUtils";
import { getEpubValueFromPath } from "../epubUtils";

export const PageView = ({
  epubObject,
  spineIndex,
  partProgress,
  focusElement,
  setFocusElement,
  formatting,
  setProgress,
}) => {
  const spine = epubObject.spine;
  const spineIndexMap = epubObject.spineIndexMap;
  const columnGap = 1;

  const getTotalPages = () =>
    document.getElementById("content")
      ? Math.floor(
          document.getElementById("content").scrollWidth / formatting.pageWidth
        ) +
        +(
          formatting.pagesShown > 1 &&
          (document.getElementById("content").scrollWidth %
            formatting.pageWidth) /
            formatting.pageWidth >
            1 / formatting.pagesShown
        )
      : 0;

  const [currentPage, setCurrentPage] = React.useState(() =>
    Math.floor(partProgress * getTotalPages())
  );

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

  const handlePathHref = (path) => {
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
    const pathSpineIndex = getEpubValueFromPath(
      spineIndexMap,
      path.includes("#") === false ? path : path.substring(0, path.indexOf("#"))
    );
    if (typeof pathSpineIndex === "number" && pathSpineIndex !== spineIndex) {
      setProgress(pathSpineIndex, 0);
    }
    let linkFragment = null;
    if (path.includes("#")) {
      linkFragment = path.substring(path.indexOf("#") + 1);
      const focusElement = {
        attributeName: "id",
        attributeValue: linkFragment,
      };
      if (path.startsWith("#") || pathSpineIndex === spineIndex) {
        return handleFocusElement(focusElement);
      }
      setFocusElement(focusElement);
    }
  };

  const handleFocusElement = (focusElement) => {
    const { attributeName, attributeValue } = focusElement;
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
    setFocusElement(null);
  };

  React.useEffect(() => {
    if (focusElement !== null) {
      handleFocusElement(focusElement);
    } else {
      setCurrentPage(Math.floor(partProgress * getTotalPages()));
    }
    const removeAllLinkListeners =
      attachOnClickListenersToLinkElements(handlePathHref);
    return () => {
      removeAllLinkListeners();
    };
  }, []);

  return (
    <SideButtons
      leftButtonOnClick={handlePreviousPage}
      rightButtonOnClick={handleNextPage}
      formatting={formatting}
    >
      <Box
        sx={{
          height: "100%",
          minWidth: `${formatting.pageWidth}px`,
          maxWidth: `${formatting.pageWidth}px`,
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
              (formatting.pageWidth - columnGap * formatting.pagesShown) /
              formatting.pagesShown
            }px`,
            transform: `translate(-${currentPage * (formatting.pageWidth + columnGap)}px);`,
          }}
          dangerouslySetInnerHTML={{
            __html:
              spine?.[spineIndex ?? -1]?.element ??
              "something went wrong...<br/> spine.current is missing",
          }}
        />
      </Box>
    </SideButtons>
  );
};

PageView.propType = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  focusElement: PropTypes.object.isRequired,
  setFocusElement: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
