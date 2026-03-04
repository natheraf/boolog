import * as React from "react";
import PropTypes from "prop-types";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import LightModeIcon from "@mui/icons-material/LightMode";
import EditIcon from "@mui/icons-material/Edit";
import { Paper, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
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
        {[
          {
            value: "midNight",
            ariaLabel: "super dark",
            title: "Mid Night",
            icon: NightsStayIcon,
          },
          {
            value: "dark",
            ariaLabel: "dark",
            title: "Dark",
            icon: DarkModeIcon,
          },
          {
            value: "twilight",
            ariaLabel: "bright",
            title: "Twilight",
            icon: WbTwilightIcon,
          },
          {
            value: "light",
            ariaLabel: "super bright",
            title: "Light",
            icon: LightModeIcon,
          },
          {
            value: "custom",
            ariaLabel: "custom",
            title: "Custom",
            icon: EditIcon,
          },
        ].map((obj) => (
          <Tooltip key={obj.value} title={obj.title}>
            <ToggleButton value={obj.value} aria-label={obj.ariaLabel}>
              <obj.icon />
            </ToggleButton>
          </Tooltip>
        ))}
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
