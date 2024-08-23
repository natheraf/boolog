import { useTheme } from "@emotion/react";
import { Button, IconButton, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";

export const DynamicButton = (props) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const { icon, text, ...otherProps } = props;

  return greaterThanSmall ? (
    <Button {...otherProps}>{text}</Button>
  ) : (
    <IconButton {...otherProps}>{icon}</IconButton>
  );
};

DynamicButton.propTypes = {
  icon: PropTypes.element.isRequired,
  text: PropTypes.string.isRequired,
};
