import * as React from "react";
import PropTypes from "prop-types";
import { Box, Fade, Stack } from "@mui/material";
import { attachOnClickListenersToLinkElements } from "../domUtils";
import { getEpubValueFromPath } from "../epubUtils";

export const ContinuousScrollView = ({
  epubObject,
  spineIndex,
  partProgress,
  forceFocus,
  setForceFocus,
  formatting,
  setProgress,
}) => {
  const spine = epubObject.spine;
  const sentinelsHeight = window.innerHeight * 1.1;
  const spineIndexMap = epubObject.spineIndexMap;

  const scrollToPercent = (percentage, boundary) => {
    const epubBody = document.getElementById("epub-body");
    const previousContentHeight =
      document?.getElementById("previous-content")?.getBoundingClientRect()
        ?.height ?? 0;
    const contentHeight = document
      .getElementById("content")
      .getBoundingClientRect().height;
    const targetScrollTop = contentHeight * percentage;
    const heightBeforeContent = previousContentHeight + sentinelsHeight;
    const includeSentinelAndPreviousChapter =
      heightBeforeContent + targetScrollTop;
    const keepScrollSmoothToNextChapter =
      percentage === 0 && boundary !== "start"
        ? includeSentinelAndPreviousChapter - window.innerHeight
        : includeSentinelAndPreviousChapter;
    const keepScrollBelowTopSentinel =
      percentage === 0.999999
        ? includeSentinelAndPreviousChapter - window.innerHeight
        : includeSentinelAndPreviousChapter;
    return epubBody.scroll({
      top: keepScrollSmoothToNextChapter,
    });
  };

  const timeoutToSetProgress = React.useRef(null);
  const onScroll = () => {
    clearTimeout(timeoutToSetProgress.current);
    const previousContent = document.getElementById("previous-content");
    const topSentinel = document.getElementById("top-sentinel");
    const topSentinelRect = topSentinel.getBoundingClientRect();
    const content = document.getElementById("content");
    const contentRect = content.getBoundingClientRect();
    const bottomSentinel = document.getElementById("bottom-sentinel");
    const bottomSentinelRect = bottomSentinel.getBoundingClientRect();
    const nextContent = document.getElementById("next-content");
    const nextContentRect = nextContent?.getBoundingClientRect();

    const scrollingToPreviousChapter =
      previousContent &&
      topSentinelRect.top > -bottomSentinelRect.height * 0.03;
    const scrollingToNextChapter =
      nextContent &&
      nextContentRect.top - bottomSentinelRect.height <
        bottomSentinelRect.height * 0.03;

    if (scrollingToPreviousChapter) {
      return setProgress(Math.max(0, spineIndex - 1), 0.999999);
    } else if (scrollingToNextChapter) {
      return setProgress(Math.min(spineIndex + 1, spine.length - 1), 0);
    }

    timeoutToSetProgress.current = setTimeout(() => {
      const appBar = document.getElementById("appBar");
      const isAppBarHiding = appBar.style.visibility === "hidden";
      const appBarHeight =
        appBar.getBoundingClientRect().height * +!isAppBarHiding;
      const avoidNegatives = Math.max(
        0,
        (-contentRect.top + appBarHeight) / contentRect.height
      );
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

  React.useEffect(() => {
    setTimeout(() => {
      // setTimeout executes after images are rendered.
      if (forceFocus?.type === "element") {
        handleFocusElement(forceFocus);
      } else {
        scrollToPercent(partProgress, forceFocus?.location);
      }
      if (forceFocus?.type === "partProgress") {
        setForceFocus(null);
      }
    });
    const epubBody = document.getElementById("epub-body");
    const timeoutId = setTimeout(() => {
      epubBody.addEventListener("scroll", onScroll);
    }, 500);
    const removeAllLinkListeners =
      attachOnClickListenersToLinkElements(handlePathHref);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutToSetProgress.current);
      removeAllLinkListeners();
      epubBody.removeEventListener("scroll", onScroll);
    };
  }, [spineIndex, forceFocus]);

  return (
    <Stack
      id="scroll-view"
      alignItems={"center"}
      sx={{
        overflow: "auto",
        backgroundColor: formatting.backgroundColor,
      }}
    >
      {spineIndex - 1 >= 0 && (
        <Fade in={true} timeout={100}>
          <Box
            id="previous-content"
            className="content"
            sx={{
              minWidth: `${formatting.pageWidth}px`,
              maxWidth: `${formatting.pageWidth}px`,
              minHeight: window.innerHeight,
            }}
            dangerouslySetInnerHTML={{
              __html:
                spine?.[spineIndex - 1 ?? -1]?.element ??
                "something went wrong...<br/> spine.current is missing",
            }}
          />
        </Fade>
      )}
      <Box id="top-sentinel" sx={{ height: sentinelsHeight }} />
      <Fade in={true} timeout={100}>
        <Box
          id="content"
          className="content"
          sx={{
            minWidth: `${formatting.pageWidth}px`,
            maxWidth: `${formatting.pageWidth}px`,
            minHeight: window.innerHeight,
          }}
          dangerouslySetInnerHTML={{
            __html:
              spine?.[spineIndex ?? -1]?.element ??
              "something went wrong...<br/> spine.current is missing",
          }}
        />
      </Fade>
      <Box id="bottom-sentinel" sx={{ height: sentinelsHeight }} />
      {spineIndex + 1 < spine.length && (
        <Fade in={true} timeout={100}>
          <Box
            id="next-content"
            className="content"
            sx={{
              minWidth: `${formatting.pageWidth}px`,
              maxWidth: `${formatting.pageWidth}px`,
              minHeight: window.innerHeight,
            }}
            dangerouslySetInnerHTML={{
              __html:
                spine?.[spineIndex + 1 ?? -1]?.element ??
                "something went wrong...<br/> spine.current is missing",
            }}
          />
        </Fade>
      )}
    </Stack>
  );
};

ContinuousScrollView.propType = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  forceFocus: PropTypes.object.isRequired,
  setForceFocus: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
