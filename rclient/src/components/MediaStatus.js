import * as React from "react";
import { Box, ToggleButton, Tooltip, useMediaQuery } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DoneIcon from "@mui/icons-material/Done";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";
import { StyledToggleButtonGroup } from "./StyledToggleButtonGroup";

export const MediaStatus = ({
  mediaObject,
  orientation,
  handleStatusOnChange,
}) => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box>
      <StyledToggleButtonGroup
        orientation={orientation}
        size={greaterThanMid ? "small" : "medium"}
        value={mediaObject.status}
        onChange={handleStatusOnChange}
        exclusive
        spacing={greaterThanMid ? 0.5 : 0}
      >
        {[
          { title: "Read", value: "Reading", icon: PlayArrowIcon },
          { title: "Pause", value: "Paused", icon: PauseIcon },
          { title: "Drop", value: "Dropped", icon: StopIcon },
          {
            title: "Plan to Read",
            value: "Planning",
            icon: PlaylistAddIcon,
          },
          { title: "Finish", value: "Finished", icon: DoneIcon },
        ].map((obj) => (
          <Tooltip
            key={obj.value}
            title={obj.title}
            placement={orientation === "vertical" ? "left" : "bottom"}
          >
            <ToggleButton value={obj.value} aria-label={obj.value}>
              <obj.icon />
            </ToggleButton>
          </Tooltip>
        ))}
      </StyledToggleButtonGroup>
    </Box>
  );
};

MediaStatus.propTypes = {
  mediaObject: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
};
