import {
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DoneIcon from "@mui/icons-material/Done";
import { useTheme } from "@emotion/react";

export const MediaStatus = () => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <ToggleButtonGroup
      orientation={greaterThanMid ? "vertical" : "horizontal"}
      size={greaterThanMid ? "small" : "medium"}
      exclusive
    >
      {[
        { title: "Read", value: "read", icon: PlayArrowIcon },
        { title: "Pause", value: "pause", icon: PauseIcon },
        { title: "Drop", value: "drop", icon: StopIcon },
        { title: "Plan to Read", value: "plan", icon: PlaylistAddIcon },
        { title: "Finish", value: "finish", icon: DoneIcon },
      ].map((obj) => (
        <Tooltip
          key={obj.value}
          title={obj.title}
          placement={greaterThanMid ? "left" : "bottom"}
        >
          <ToggleButton value={obj.value} aria-label={obj.value}>
            <obj.icon />
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};
