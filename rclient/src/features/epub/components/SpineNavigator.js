import PropTypes from "prop-types";
import { Box, Stack, Tooltip } from "@mui/material";

export const SpineNavigator = ({
  epubObject,
  spineIndex,
  formatting,
  setProgress,
}) => {
  const arrayForSpineNavigator = epubObject.chapterMeta;
  const spineNavigateSize = 10;

  const handleOnClick = (spineIndex) => {
    setProgress(spineIndex, 0);
  };

  return formatting.showSpineNavigator ? (
    <Stack
      sx={{
        height: "100%",
        overflow: "hidden",
        maxWidth: `${spineNavigateSize}px`,
        minWidth: `${spineNavigateSize}px`,
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
              borderRadius: "10px",
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
};
