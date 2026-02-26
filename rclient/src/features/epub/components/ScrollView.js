import * as React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { attachOnClickListenersToLinkElements } from "../domUtils";

export const ScrollView = ({
  spine,
  spineIndex,
  partProgress,
  formatting,
  setProgress,
}) => {
  const sentinelsHeight = window.innerHeight;

  const scrollToPercent = (percentage) => {
    const epubBody = document.getElementById("epub-body");
    const content = document.getElementById("content");
    const contentRect = content.getBoundingClientRect();
    const height = contentRect.height;
    const targetScrollTop = height * percentage;
    const includeSentinel = targetScrollTop + sentinelsHeight;
    if (height > includeSentinel) {
      return epubBody.scroll({
        top: includeSentinel,
      });
    }
    const keepScrollAboveBottomSentinel = Math.min(height, includeSentinel);
    epubBody.scroll({
      top: keepScrollAboveBottomSentinel,
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
      timeOutToSetProgress.current = setTimeout(() => {
        if (goPreviousChapter) {
          setProgress(Math.max(0, spineIndex - 1), 0.999999);
        } else if (goNextChapter) {
          setProgress(Math.min(spineIndex + 1, spine.length - 1), 0);
        }
      }, 100);
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

  React.useEffect(() => {
    scrollToPercent(partProgress);
    const epubBody = document.getElementById("epub-body");
    const timeoutId = setTimeout(() => {
      epubBody.addEventListener("scroll", onScroll);
    }, 500);
    attachOnClickListenersToLinkElements();
    return () => {
      clearTimeout(timeoutId);
      epubBody.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Box
      id="scroll-view"
      sx={{
        overflow: "auto",
        justifyItems: "center",
        backgroundColor: formatting.backgroundColor,
      }}
    >
      <Box sx={{ height: sentinelsHeight }} />
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
      <Box sx={{ height: sentinelsHeight }} />
    </Box>
  );
};

ScrollView.propType = {
  spine: PropTypes.array.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
