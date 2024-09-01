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
import { DeleteMediaDialog } from "./DeleteMediaDialog";

export const MediaStatus = ({
  mediaObj,
  apiFunctions,
  mediaUniqueIdentifier,
  orientation,
}) => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const [libraryEquivalentMediaObj, setLibraryEquivalentMediaObj] =
    React.useState({ status: null });
  const [openDeleteAlert, setOpenDeleteAlert] = React.useState(false);

  React.useEffect(() => {
    if (mediaUniqueIdentifier === "isbn") {
      setLibraryEquivalentMediaObj({ status: null });
      apiFunctions
        .getBook("isbn", mediaObj.isbn[0])
        .then((res) => setLibraryEquivalentMediaObj(res ?? mediaObj))
        .catch((error) => console.log(error));
    } else {
      setLibraryEquivalentMediaObj(mediaObj);
    }
  }, [apiFunctions, mediaObj, mediaUniqueIdentifier]);

  const handleStatusOnChange = (event, value) => {
    if (value === null) {
      setOpenDeleteAlert(true);
    } else {
      libraryEquivalentMediaObj.status = value;
      apiFunctions.setBook(libraryEquivalentMediaObj);
      setLibraryEquivalentMediaObj((prev) => ({ ...prev, status: value }));
    }
  };

  return (
    <Box>
      <DeleteMediaDialog
        openDeleteAlert={openDeleteAlert}
        setOpenDeleteAlert={setOpenDeleteAlert}
        apiFunctions={apiFunctions}
        mediaObj={libraryEquivalentMediaObj}
        mediaUniqueIdentifier={mediaUniqueIdentifier}
      />
      <StyledToggleButtonGroup
        orientation={orientation}
        size={greaterThanMid ? "small" : "medium"}
        value={libraryEquivalentMediaObj.status}
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
