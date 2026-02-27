import * as React from "react";
import PropTypes from "prop-types";
import { Box, Fade, Stack } from "@mui/material";
import { attachOnClickListenersToLinkElements } from "../domUtils";

export const ContinuousScrollView = ({
  spine,
  spineIndex,
  partProgress,
  formatting,
  setProgress,
}) => {
  const sentinelsHeight = window.innerHeight * 0.5;

  const scrollToPercent = (percentage) => {
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
    const keepScrollAboveBottomSentinel =
      percentage === 0.999999
        ? includeSentinelAndPreviousChapter - window.innerHeight
        : includeSentinelAndPreviousChapter;
    return epubBody.scroll({
      top: keepScrollAboveBottomSentinel,
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
      topSentinelRect.top + bottomSentinelRect.height * 0.1 >
        window.innerHeight;
    const scrollingToNextChapter =
      nextContent && nextContentRect.top - bottomSentinelRect.height * 0.2 < 0;

    if (scrollingToPreviousChapter) {
      return setProgress(Math.max(0, spineIndex - 1), 0.999999);
    } else if (scrollingToNextChapter) {
      return setProgress(Math.min(spineIndex + 1, spine.length - 1), 0);
    }

    timeoutToSetProgress.current = setTimeout(() => {
      const avoidNegatives = Math.max(0, -contentRect.top / contentRect.height);
      const avoidOne = Math.min(0.999999, avoidNegatives);
      setProgress(spineIndex, avoidOne);
    }, 500);
  };

  React.useEffect(() => {
    scrollToPercent(partProgress);
    const epubBody = document.getElementById("epub-body");
    const timeoutId = setTimeout(() => {
      epubBody.addEventListener("scroll", onScroll);
    }, 500);
    attachOnClickListenersToLinkElements();
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutToSetProgress.current);
      epubBody.removeEventListener("scroll", onScroll);
    };
  }, []);

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
      )}
      <Box id="top-sentinel" sx={{ height: sentinelsHeight }} />
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
      <Box id="bottom-sentinel" sx={{ height: sentinelsHeight }} />
      {spineIndex + 1 < spine.length && (
        <Fade in={true}>
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
  spine: PropTypes.array.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
