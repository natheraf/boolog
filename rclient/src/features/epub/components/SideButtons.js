import PropTypes from "prop-types";
import { Box, Stack } from "@mui/material";

export const SideButtons = ({
  children,
  leftButtonOnClick,
  rightButtonOnClick,
  formatting,
}) => {
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
          cursor: "pointer",
          zIndex: 1,
          backgroundColor: formatting.pageColor,
        }}
      />
      {children}
      <Box
        id="next-page-button"
        onClick={rightButtonOnClick}
        sx={{
          width: "100%",
          height: "100%",
          cursor: "pointer",
          zIndex: 1,
          backgroundColor: formatting.pageColor,
        }}
      />
    </Stack>
  );
};

SideButtons.propTypes = {
  children: PropTypes.element.isRequired,
  leftButtonOnClick: PropTypes.func.isRequired,
  rightButtonOnClick: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
};
