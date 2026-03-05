import PropTypes from "prop-types";
import { Box, Divider, Stack } from "@mui/material";

export const SideButtons = ({
  children,
  leftButtonOnClick,
  rightButtonOnClick,
  formatting,
}) => {
  const dividerVisibility = formatting.showDividers ? "visible" : "hidden";
  const showLeftDivider =
    formatting.textAlign.value === "end" ||
    formatting.textAlign.value === "center";
  const showRightDivider =
    formatting.textAlign.value === "start" ||
    formatting.textAlign.value === "inherit" ||
    formatting.textAlign.value === "center";

  return (
    <Stack
      direction="row"
      alignItems={"center"}
      justifyContent={"center"}
      sx={{ height: "100%" }}
      spacing={0}
      overflow="hidden"
    >
      <Box
        id="previous-page-button"
        onClick={leftButtonOnClick}
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          zIndex: 1,
          backgroundColor: formatting.pageColor,
        }}
      >
        {showLeftDivider && (
          <Divider
            orientation="vertical"
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              visibility: dividerVisibility,
              opacity: formatting.opacityOfSideElements,
            }}
          />
        )}
      </Box>
      {children}
      <Box
        id="next-page-button"
        onClick={rightButtonOnClick}
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          zIndex: 1,
          backgroundColor: formatting.pageColor,
        }}
      >
        {showRightDivider && (
          <Divider
            orientation="vertical"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              visibility: dividerVisibility,
              opacity: formatting.opacityOfSideElements,
            }}
          />
        )}
      </Box>
    </Stack>
  );
};

SideButtons.propTypes = {
  children: PropTypes.element.isRequired,
  leftButtonOnClick: PropTypes.func.isRequired,
  rightButtonOnClick: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
};
