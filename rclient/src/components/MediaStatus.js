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

export const MediaStatus = ({
  mediaObj,
  apiFunctions,
  mediaUniqueIdentifier,
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
      <Dialog
        open={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        aria-labelledby="delete-entry"
        aria-describedby="delete-this-media-from-library"
      >
        <DialogTitle>Delete this from library?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deleting this from your library will delete all data relating to
            this entry. Please reconsider to drop instead.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDeleteAlert(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              setOpenDeleteAlert(false);
              setStatus(null);
              apiFunctions.deleteBook(mediaObj);
            }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
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
    </Box>
  );
};

MediaStatus.propTypes = {
  mediaObj: PropTypes.object.isRequired,
  apiFunctions: PropTypes.object.isRequired,
  mediaUniqueIdentifier: PropTypes.string.isRequired,
};
