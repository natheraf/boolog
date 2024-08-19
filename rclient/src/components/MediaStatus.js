import * as React from "react";
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
import PropTypes from "prop-types";

export const MediaStatus = ({ mediaObj, apiFunctions }) => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const [status, setStatus] = React.useState();
  apiFunctions.getBookStatus(mediaObj, setStatus);

  React.useEffect(() => {
    setStatus(null);
  }, [mediaObj]);

  const handleStatusOnChange = (event, value) => {
    if (value === null) {
      // delete
    } else {
      // add
      apiFunctions.setBookStatus({ status: value, ...mediaObj });
      setStatus(value);
    }
  };

  return (
    <ToggleButtonGroup
      orientation={greaterThanMid ? "vertical" : "horizontal"}
      size={greaterThanMid ? "small" : "medium"}
      value={status}
      onChange={handleStatusOnChange}
      exclusive
    >
      {[
        { title: "Read", value: "Reading", icon: PlayArrowIcon },
        { title: "Pause", value: "Paused", icon: PauseIcon },
        { title: "Drop", value: "Dropped", icon: StopIcon },
        { title: "Plan to Read", value: "Planning", icon: PlaylistAddIcon },
        { title: "Finish", value: "Finished", icon: DoneIcon },
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

MediaStatus.propTypes = {
  mediaObj: PropTypes.object.isRequired,
  apiFunctions: PropTypes.object.isRequired,
};
