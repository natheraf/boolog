import * as React from "react";
import PropTypes from "prop-types";
import { Box, Slide, Stack } from "@mui/material";
import { attachOnClickListenersToLinkElements } from "../domUtils";
import { getEpubValueFromPath } from "../epubUtils";

export const ScrollView = ({
  epubObject,
  spineIndex,
  partProgress,
  forceFocus,
  setForceFocus,
  formatting,
  setProgress,
}) => {
  const spine = epubObject.spine;
  const sentinelsHeight = window.innerHeight;
  const spineIndexMap = epubObject.spineIndexMap;
  const highlightBorderSafety = 25;
  const pageWidth = Math.min(
    formatting.pageWidth,
    window.innerWidth - highlightBorderSafety
  );

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
  const onScroll = (event) => {
    clearTimeout(timeOutToSetProgress.current);
    const content = document.getElementById("content");
    const contentRect = content.getBoundingClientRect();
    const goPreviousChapter = event.target.scrollTop <= 5;
    const onFirstChapter = spineIndex === 0;
    const goNextChapter =
      contentRect.height +
        sentinelsHeight * (2 - +onFirstChapter) -
        (event.target.scrollTop + window.innerHeight) <
      5;

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
      const appBar = document.getElementById("appBar");
      const isAppBarHiding = appBar.style.visibility === "hidden";
      const appBarHeight =
        appBar.getBoundingClientRect().height * +!isAppBarHiding;
      const includeAppBarHeight = -contentRect.top + appBarHeight;
      const percentage = includeAppBarHeight / contentRect.height;
      const avoidNegatives = Math.max(0, percentage);
      const avoidOne = Math.min(0.999999, avoidNegatives);
      setProgress(spineIndex, avoidOne);
    }, 500);
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
      const forceFocus = {
        type: "element",
        attributeName: "id",
        attributeValue: linkFragment,
      };
      if (path.startsWith("#") || pathSpineIndex === spineIndex) {
        return handleFocusElement(forceFocus);
      }
      setForceFocus(forceFocus);
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
      const elementPositionPercentage =
        (elementRect.top - contentRect.top) / contentRect.height;
      setProgress(spineIndex, elementPositionPercentage);
      scrollToPercent(elementPositionPercentage);
    }
    setForceFocus(null);
  };

  /**
   * Keep progress react state updated when scrolling for history management
   */
  React.useEffect(() => {
    const epubBody = document.getElementById("epub-body");
    const timeoutId = setTimeout(() => {
      epubBody.addEventListener("scroll", onScroll);
    }, 300);
    const removeAllLinkListeners =
      attachOnClickListenersToLinkElements(handlePathHref);
    return () => {
      clearTimeout(timeoutId);
      epubBody.removeEventListener("scroll", onScroll);
      clearTimeout(timeOutToSetProgress.current);
      removeAllLinkListeners();
    };
  }, [partProgress]);

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
  }, [forceFocus]);

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

ScrollView.propType = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  forceFocus: PropTypes.object.isRequired,
  setForceFocus: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
