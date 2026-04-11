import React from "react";
import PropTypes from "prop-types";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { appBarHeight } from "./HeaderV2";
import { navigationTabSize } from "../../../api/Local";

export const SpineNavigator = ({
  epubObject,
  spineIndex,
  partProgress,
  formatting,
  setProgress,
  displayOptions,
}) => {
  const autoHideHeader = displayOptions.autoHideHeader;
  const spine = epubObject.spine;
  const arrayForSpineNavigator = epubObject.chapterMeta;
  const spineNavigateSize = navigationTabSize;
  const totalWords = epubObject.metadata.common.words.value;
  const totalPercent = Math.trunc(
    ((spine
      .slice(0, spineIndex)
      .reduce((acc, val) => acc + (val.wordCount ?? 0), 0) +
      (spine[spineIndex]?.wordCount ?? 0) * partProgress) /
      totalWords) *
      100
  );

  const getChapterPartSizeInNav = (index) => {
    return Math.max(
      1,
      Math.ceil(
        ((arrayForSpineNavigator[index]?.wordCount ?? 1) / totalWords) * 100
      )
    );
  };

  const handleOnClick = (spineIndex) => {
    setProgress(spineIndex, 0);
  };

  const calculatedAppBarHeight = appBarHeight * +!autoHideHeader;
  const viewHeight = window.innerHeight - calculatedAppBarHeight;

  return displayOptions.showSpineNavigator ? (
    <Stack
      sx={{
        height: viewHeight,
        maxWidth: `${spineNavigateSize}px`,
        minWidth: `${spineNavigateSize}px`,
        position: "absolute",
        left: 0,
        top: calculatedAppBarHeight,
        zIndex: 2,
      }}
      direction={"column"}
    >
      {arrayForSpineNavigator.map((obj, index) => (
        <Tooltip key={obj.label} title={obj.label} placement="right" arrow>
          <Box
            onClick={() => handleOnClick(obj.spineStartIndex)}
            sx={{
              backgroundColor: formatting.textColor,
              opacity: spineIndex >= obj.spineStartIndex ? 0.5 : 0.2,
              cursor: "pointer",
              height: `${getChapterPartSizeInNav(index)}%`,
              width: "100%",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
            }}
          />
        </Tooltip>
      ))}
      <Typography color="gray" variant="subtitle2">
        {totalPercent}%
      </Typography>
    </Stack>
  ) : null;
};

SpineNavigator.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  formatting: PropTypes.object.isRequired,
  displayOptions: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
