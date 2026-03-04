import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import PanoramaVerticalIcon from "@mui/icons-material/PanoramaVertical";

export const EpubViewEditor = ({ view, setView }) => {
  const handleOnChange = (_event, newView) => {
    if (newView === null) {
      return;
    }
    setView(newView);
  };

  return (
    <Paper>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleOnChange}
        aria-label="color preset"
        orientation={"vertical"}
      >
        {[
          {
            value: "page",
            ariaLabel: "page view",
            title: "Page View",
            label: "Pagination",
            icon: ViewCarouselIcon,
          },
          {
            value: "scroll",
            ariaLabel: "scroll view",
            title: "Scroll View",
            label: "Endless Scroll",
            icon: PanoramaVerticalIcon,
          },
        ].map((obj) => (
          <ToggleButton
            key={obj.value}
            value={obj.value}
            aria-label={obj.ariaLabel}
          >
            <Stack
              direction={"row"}
              spacing={5}
              justifyContent={"space-between"}
              sx={{ width: "100%" }}
            >
              <Box>{obj.label}</Box>
              {<obj.icon />}
            </Stack>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
};

EpubViewEditor.propTypes = {
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
};
