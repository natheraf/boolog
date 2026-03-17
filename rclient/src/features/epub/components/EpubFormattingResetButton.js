import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { getDefaultFormatting } from "../../../api/Local";
import { useTheme } from "@emotion/react";
import { getFormattingWithPreset } from "../formattingUtils";

export const EpubFormattingResetButton = ({ epubPreset, setFormatting }) => {
  const theme = useTheme();
  const handleOnClick = () => {
    const defaultFormatting = getDefaultFormatting(theme);
    const applyCurrentPreset = getFormattingWithPreset(
      epubPreset,
      defaultFormatting
    );
    setFormatting(applyCurrentPreset);
  };

  return (
    <Button onClick={handleOnClick} variant="text" color="error">
      Reset to Default
    </Button>
  );
};

EpubFormattingResetButton.propTypes = {
  epubPreset: PropTypes.string.isRequired,
  setFormatting: PropTypes.func.isRequired,
};
