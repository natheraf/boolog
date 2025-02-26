import { useTheme } from "@emotion/react";
import { Button, IconButton, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";

export const DynamicButton = (props) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const { icon, text, endIcon, ...otherProps } = props;

  return greaterThanSmall ? (
    <Button endIcon={endIcon} {...otherProps}>
      {text}
    </Button>
  ) : (
    <IconButton {...otherProps}>{icon}</IconButton>
  );
};

DynamicButton.propTypes = {
  endIcon: PropTypes.element,
  icon: PropTypes.element.isRequired,
  text: PropTypes.string.isRequired,
};
