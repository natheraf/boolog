import * as React from "react";
import PropTypes from "prop-types";
import { Paper, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import ViewDayIcon from "@mui/icons-material/ViewDay";

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
      >
        {[
          {
            value: "page",
            ariaLabel: "page view",
            title: "Page View",
            icon: <ViewDayIcon />,
          },
          {
            value: "scroll",
            ariaLabel: "scroll view",
            title: "Scroll View",
            icon: <ViewDayIcon sx={{ transform: "rotate(90deg)" }} />,
          },
        ].map((obj) => (
          <Tooltip key={obj.value} title={obj.title}>
            <ToggleButton value={obj.value} aria-label={obj.ariaLabel}>
              {obj.icon}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
};

EpubViewEditor.propTypes = {
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
};
