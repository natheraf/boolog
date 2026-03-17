import * as React from "react";
import PropTypes from "prop-types";
import { Box, Stack, Tooltip } from "@mui/material";
import { appBarHeight } from "./HeaderV2";
import { useTheme } from "@emotion/react";

export const ChapterNavigator = ({
  epubObject,
  spineIndex,
  formatting,
  setProgress,
  autoHideHeader,
  currentPage,
  setCurrentPage,
}) => {
  const theme = useTheme();
  const spine = epubObject.spine;
  const chapterMeta = epubObject.chapterMeta;
  const chapterNavigateSize = 10;
  const viewHeight = window.innerHeight - appBarHeight * +!autoHideHeader;

  const arrayForPreviousChapterNavigator =
    spineIndex === null || spineIndex === spine.length - 1
      ? []
      : [...new Array(spine[spineIndex].backCount).keys()];

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
  const [arrayForPageNavigator, setArrayForPageNavigator] = React.useState([]);

  const arrayForNextChapterNavigator =
    spineIndex === null || spineIndex === spine.length - 1
      ? []
      : [...new Array(spine[spineIndex].frontCount).keys()];

  const getChapterPartSizeInNav = (index, part) => {
    if (part === "previous") {
      index = spineIndex - (spine[spineIndex].backCount - index);
    }
    if (part === "next") {
      index = spineIndex + index + 1;
    }
    return Math.max(
      2,
      Math.ceil(
        ((spine[index]?.wordCount ?? 1) /
          (chapterMeta[spine[index].chapterMetaIndex]?.wordCount ?? 1)) *
          100
      )
    );
  };

  const getCurrentPartColor = (currentPage, index) => {
    if (currentPage < index) {
      return formatting.textColor;
    } else if (currentPage > index) {
      return theme.palette.primary.dark;
    } else {
      return theme.palette.secondary.main;
    }
  };

  const handleBackChapterOnClick = (index) => {
    const targetSpineIndex = spineIndex - (spine[spineIndex].backCount - index);
    setProgress(targetSpineIndex, 0.999999);
  };

  const handleCurrentChapterOnClick = (index) => {
    setCurrentPage(index);
  };

  const handleForwardChapterOnClick = (index) => {
    setProgress(spineIndex + (index + 1), 0);
  };

  React.useEffect(() => {
    setArrayForPageNavigator([...new Array(getTotalPages()).keys()]);
  }, [spineIndex, currentPage, formatting]);

  return (
    <Stack
      sx={{
        height: viewHeight,
        overflow: "hidden",
        maxWidth: `${chapterNavigateSize}px`,
        minWidth: `${chapterNavigateSize}px`,
        position: "absolute",
        right: 0,
        bottom: 0,
        zIndex: 2,
      }}
      spacing={0.3}
    >
      {arrayForPreviousChapterNavigator.map((index) => (
        <Tooltip key={index} title={`Part ${index + 1}`} placement="left" arrow>
          <Box
            onClick={() => {
              handleBackChapterOnClick(index);
            }}
            sx={{
              backgroundColor: `${theme.palette.primary.dark}`,
              opacity: 0.4,
              cursor: "pointer",
              height: `${getChapterPartSizeInNav(index, "previous")}%`,
              borderTopLeftRadius: "7px",
              borderBottomLeftRadius: "7px",
              position: "relative",
              right: -3,
            }}
          />
        </Tooltip>
      ))}
      <Stack
        sx={{ height: `${getChapterPartSizeInNav(spineIndex)}%` }}
        spacing={0}
        direction={"column"}
      >
        {arrayForPageNavigator.map((index) => (
          <Tooltip key={index} title={`Pg ${index + 1}`} placement="left" arrow>
            <Box
              onClick={() => handleCurrentChapterOnClick(index)}
              sx={{
                backgroundColor: getCurrentPartColor(currentPage, index),
                opacity: currentPage < index ? 0.3 : 0.4,
                cursor: "pointer",
                height: "100%",
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
                borderBottom: `3px solid ${formatting.textColor}`,
                position: "relative",
              }}
            />
          </Tooltip>
        ))}
      </Stack>
      {arrayForNextChapterNavigator.map((index) => (
        <Tooltip
          key={index}
          title={`Part ${
            spine[spineIndex].backCount +
            spine[spineIndex].frontCount +
            1 -
            (spine[spineIndex].frontCount - index) +
            1
          }`}
          placement="left"
          arrow
        >
          <Box
            onClick={() => {
              handleForwardChapterOnClick(index);
            }}
            sx={{
              backgroundColor: `${formatting.textColor}`,
              opacity: 0.2,
              cursor: "pointer",
              height: `${getChapterPartSizeInNav(index, "next")}%`,
              borderTopLeftRadius: "7px",
              borderBottomLeftRadius: "7px",
              position: "relative",
              right: -3,
            }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
};

ChapterNavigator.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
  autoHideHeader: PropTypes.bool.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};
