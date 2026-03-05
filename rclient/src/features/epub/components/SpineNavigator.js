import PropTypes from "prop-types";
import { Box, Stack, Tooltip } from "@mui/material";

export const SpineNavigator = ({
  epubObject,
  spineIndex,
  formatting,
  setProgress,
}) => {
  const arrayForSpineNavigator = epubObject.chapterMeta;
  const spineNavigateHeight = 10;

  const handleOnClick = (spineIndex) => {
    setProgress(spineIndex, 0);
  };

  return formatting.showSpineNavigator ? (
    <Stack
      justifyContent="center"
      sx={{
        maxHeight: `${spineNavigateHeight}px`,
        minHeight: `${spineNavigateHeight}px`,
        overflow: "hidden",
        width: "100%",
        backgroundColor: formatting.pageColor,
      }}
      direction={"row"}
    >
      {arrayForSpineNavigator.map((obj) => (
        <Tooltip key={obj.label} title={obj.label} arrow>
          <Box
            onClick={() => handleOnClick(obj.spineStartIndex)}
            sx={{
              backgroundColor: formatting.textColor,
              opacity: spineIndex >= obj.spineStartIndex ? 0.5 : 0.2,
              cursor: "pointer",
              width: "100%",
              borderRadius: "10px",
              marginBottom: `-5px`,
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
