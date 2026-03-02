import * as React from "react";
import PropTypes from "prop-types";
import { Box, Slide } from "@mui/material";
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

  const scrollToPercent = (percentage) => {
    const epubBody = document.getElementById("epub-body");
    const contentHeight = document
      .getElementById("content")
      .getBoundingClientRect().height;
    const targetScrollTop = contentHeight * percentage;
    const includeSentinel = targetScrollTop + sentinelsHeight;
    const keepScrollAboveBottomSentinel =
      percentage === 0.999999
        ? includeSentinel - sentinelsHeight * 0.5
        : includeSentinel;
    const showABitOfTopSentinel =
      percentage === 0
        ? includeSentinel - sentinelsHeight * 0.5
        : keepScrollAboveBottomSentinel;
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
    const goNextChapter =
      contentRect.height +
        sentinelsHeight * 2 -
        (event.target.scrollTop + window.innerHeight) <
      5;

    if (goPreviousChapter || goNextChapter) {
      if (goPreviousChapter) {
        setProgress(Math.max(0, spineIndex - 1), 0.999999);
      } else if (goNextChapter) {
        setProgress(Math.min(spineIndex + 1, spine.length - 1), 0);
      }
      return;
    }

    timeOutToSetProgress.current = setTimeout(() => {
      if (contentRect.top > 0) {
        setProgress(spineIndex, 0);
        return;
      }
      setProgress(spineIndex, -contentRect.top / contentRect.height);
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
    attachOnClickListenersToLinkElements();
    return () => {
      clearTimeout(timeoutId);
      removeAllLinkListeners();
      epubBody.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Box
      id="scroll-view"
      sx={{
        overflow: "hidden",
        justifyItems: "center",
        backgroundColor: formatting.backgroundColor,
      }}
    >
      <Box sx={{ height: sentinelsHeight }} />
      <Slide
        in={true}
        timeout={200}
        direction={partProgress === 0.999999 ? "down" : "up"}
      >
        <Box
          id="content"
          sx={{
            minWidth: `${formatting.pageWidth}px`,
            maxWidth: `${formatting.pageWidth}px`,
          }}
          dangerouslySetInnerHTML={{
            __html:
              spine?.[spineIndex ?? -1]?.element ??
              "something went wrong...<br/> spine.current is missing",
          }}
        />
      </Slide>
      <Box sx={{ height: sentinelsHeight }} />
    </Box>
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
