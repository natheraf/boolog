import * as React from "react";
import PropTypes from "prop-types";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import LightModeIcon from "@mui/icons-material/LightMode";
import EditIcon from "@mui/icons-material/Edit";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { setStateValue } from "../../../api/IndexedDB/State";
import { getFormattingWithPreset } from "../formattingUtils";

export const EpubFormattingPresets = ({
  formatting,
  setFormatting,
  preset,
  setPreset,
}) => {
  const handleOnChange = (_event, newPreset) => {
    if (newPreset === null) {
      return;
    }
    setFormatting(getFormattingWithPreset(newPreset, formatting));
    setPreset(newPreset);
    setStateValue("epubPreset", newPreset);
  };

  return (
    <Paper>
      <ToggleButtonGroup
        value={preset}
        exclusive
        onChange={handleOnChange}
        aria-label="color preset"
      >
        <ToggleButton value="midNight" aria-label="super dark">
          <NightsStayIcon />
        </ToggleButton>
        <ToggleButton value="dark" aria-label="dark">
          <DarkModeIcon />
        </ToggleButton>
        <ToggleButton value="twilight" aria-label="bright">
          <WbTwilightIcon />
        </ToggleButton>
        <ToggleButton value="light" aria-label="super bright">
          <LightModeIcon />
        </ToggleButton>
        <ToggleButton value="custom" aria-label="custom">
          <EditIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
};

EpubFormattingPresets.propTypes = {
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
  preset: PropTypes.string.isRequired,
  setPreset: PropTypes.func.isRequired,
};
