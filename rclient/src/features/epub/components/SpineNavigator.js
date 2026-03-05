import PropTypes from "prop-types";
import { Box, Stack, Tooltip } from "@mui/material";
import { appBarHeight } from "./HeaderV2";

export const SpineNavigator = ({
  epubObject,
  spineIndex,
  formatting,
  setProgress,
  autoHide,
}) => {
  const arrayForSpineNavigator = epubObject.chapterMeta;
  const spineNavigateSize = 10;

  const handleOnClick = (spineIndex) => {
    setProgress(spineIndex, 0);
  };

  const viewHeight = window.innerHeight - appBarHeight * +!autoHide;

  return formatting.showSpineNavigator ? (
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
      {arrayForSpineNavigator.map((obj) => (
        <Tooltip key={obj.label} title={obj.label} placement="right" arrow>
          <Box
            onClick={() => handleOnClick(obj.spineStartIndex)}
            sx={{
              backgroundColor: formatting.textColor,
              opacity: spineIndex >= obj.spineStartIndex ? 0.5 : 0.2,
              cursor: "pointer",
              height: "100%",
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
  setProgress: PropTypes.func.isRequired,
  autoHide: PropTypes.bool.isRequired,
};
