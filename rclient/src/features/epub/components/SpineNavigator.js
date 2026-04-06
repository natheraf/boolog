import PropTypes from "prop-types";
import { Box, Stack, Tooltip } from "@mui/material";
import { appBarHeight } from "./HeaderV2";
import { navigationTabSize } from "../../../api/Local";

export const SpineNavigator = ({
  epubObject,
  spineIndex,
  formatting,
  setProgress,
  displayOptions,
}) => {
  const autoHideHeader = displayOptions.autoHideHeader;
  const arrayForSpineNavigator = epubObject.chapterMeta;
  const spineNavigateSize = navigationTabSize;
  const totalWords = epubObject.metadata.common.words.value;

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

  const viewHeight = window.innerHeight - appBarHeight * +!autoHideHeader;

  return displayOptions.showSpineNavigator ? (
    <Stack
      sx={{
        height: viewHeight,
        overflow: "hidden",
        maxWidth: `${spineNavigateSize}px`,
        minWidth: `${spineNavigateSize}px`,
        position: "absolute",
        left: 0,
        bottom: 0,
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
    </Stack>
  ) : null;
};

SpineNavigator.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  formatting: PropTypes.object.isRequired,
  displayOptions: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
