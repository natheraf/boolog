import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ToggleButton,
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
import { StyledToggleButtonGroup } from "./StyledToggleButtonGroup";
import { DeleteMediaDialog } from "./DeleteMediaDialog";

export const MediaStatus = ({
  mediaObj,
  apiFunctions,
  mediaUniqueIdentifier,
  orientation,
}) => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const [status, setStatus] = React.useState(mediaObj.status);
  const [openDeleteAlert, setOpenDeleteAlert] = React.useState(false);

  React.useEffect(() => {
    if (mediaUniqueIdentifier === "isbn") {
      setStatus(null);
      apiFunctions
        .getBookStatus(mediaObj, mediaUniqueIdentifier)
        .then((res) => setStatus(res))
        .catch((error) => console.log(error));
    } else {
      setStatus(mediaObj.status);
    }
  }, [apiFunctions, mediaObj, mediaUniqueIdentifier]);

  const handleStatusOnChange = (event, value) => {
    if (value === null) {
      setOpenDeleteAlert(true);
    } else {
      mediaObj.status = value;
      apiFunctions.setBookStatus(mediaObj, mediaUniqueIdentifier);
      setStatus(value);
    }
  };

  return (
    <Box>
      <DeleteMediaDialog
        openDeleteAlert={openDeleteAlert}
        setOpenDeleteAlert={setOpenDeleteAlert}
        setStatus={setStatus}
        apiFunctions={apiFunctions}
        mediaObj={mediaObj}
        mediaUniqueIdentifier={mediaUniqueIdentifier}
      />
      <StyledToggleButtonGroup
        orientation={orientation}
        size={greaterThanMid ? "small" : "medium"}
        value={status}
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
  mediaObj: PropTypes.object.isRequired,
  apiFunctions: PropTypes.object.isRequired,
  mediaUniqueIdentifier: PropTypes.string.isRequired,
  orientation: PropTypes.string.isRequired,
};
