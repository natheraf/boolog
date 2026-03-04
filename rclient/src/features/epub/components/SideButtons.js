import PropTypes from "prop-types";
import { Box, Divider, Stack } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export const SideButtons = ({
  children,
  leftButtonOnClick,
  rightButtonOnClick,
  formatting,
}) => {
  const arrowVisibility = formatting.showArrows ? "visible" : "hidden";
  const dividerVisibility = formatting.showDividers ? "visible" : "hidden";

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
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: formatting.pageColor,
            justifyContent: "flex-end",
          }}
        />
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
        <NavigateBeforeIcon
          sx={{
            position: "fixed",
            left: 0,
            top: "50%",
            margin: "auto",
            visibility: arrowVisibility,
            opacity: formatting.opacityOfSideElements,
          }}
          htmlColor={"gray"}
        />
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
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: formatting.pageColor,
            justifyContent: "flex-end",
          }}
        />
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
        <NavigateNextIcon
          sx={{
            position: "fixed",
            right: 0,
            top: "50%",
            margin: "auto",
            visibility: arrowVisibility,
            opacity: formatting.opacityOfSideElements,
          }}
          htmlColor={"gray"}
        />
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
