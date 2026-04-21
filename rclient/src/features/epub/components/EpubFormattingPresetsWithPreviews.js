import * as React from "react";
import PropTypes from "prop-types";
import { getFormattingWithPreset, presets } from "../formattingUtils";
import {
  Box,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

export const EpubFormattingPresetsWithPreviews = ({
  formatting,
  setFormatting,
}) => {
  const sampleText = [
    `“Those are gruns...?” I asked.`,
    `“That’s right.”`,
    `“They don’t look anything like my Lessy! They’re not cute in the slightest!”`,
  ];
  const handleOnChange = (_event, preset) => {
    if (preset === null) {
      return;
    }
    setFormatting(getFormattingWithPreset({ ...formatting, preset }));
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <Box sx={{ padding: 1 }}>
        <Typography variant="h6" textAlign={"center"}>
          Presets
        </Typography>
      </Box>
      <ToggleButtonGroup
        color="secondary"
        fullWidth
        orientation="vertical"
        value={formatting.preset}
        exclusive
        onChange={handleOnChange}
        aria-label="color preset"
      >
        {[
          {
            value: "midNight",
            ariaLabel: "super dark",
            title: "Mid Night (OLED)",
          },
          {
            value: "dark",
            ariaLabel: "dark",
            title: "Dark (OLED)",
          },
          {
            value: "ash",
            ariaLabel: "ash",
            title: "Ash",
          },
          {
            value: "twilight",
            ariaLabel: "bright",
            title: "Twilight",
          },
          {
            value: "light",
            ariaLabel: "super bright",
            title: "Light",
          },
          {
            value: "custom",
            ariaLabel: "custom",
            title: "Custom",
          },
        ].map((obj) => (
          <ToggleButton
            key={obj.value}
            value={obj.value}
            aria-label={obj.ariaLabel}
            sx={{
              padding: 1,
              textTransform: "none",
              textAlign: "start",
            }}
          >
            <Stack spacing={1} sx={{ width: "100%", height: "100%" }}>
              <Stack direction={"row"}>
                <Typography sx={{ opacity: ".9" }}>{obj.title}</Typography>
              </Stack>
              <Stack
                sx={{
                  borderRadius: 1,
                  padding: 1,
                  backgroundColor: presets.get(obj.value).pageColor,
                  color: presets.get(obj.value).textColor ?? "white",
                  textIndent: "1rem",
                }}
              >
                {sampleText.map((text) => (
                  <Typography key={text}>{text}</Typography>
                ))}
              </Stack>
            </Stack>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
};

EpubFormattingPresetsWithPreviews.propTypes = {
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
};
