import * as React from "react";
import PropTypes from "prop-types";
import {
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const HistoryButtons = ({
  epubObject,
  history,
  historyIndex,
  setHistoryIndex,
  setProgress,
}) => {
  const spine = epubObject.spine;

  const [backMenuAnchorEl, setBackMenuAnchorEl] = React.useState(null);
  const openBackMenu = Boolean(backMenuAnchorEl);

  const [forwardMenuAnchorEl, setForwardMenuAnchorEl] = React.useState(null);
  const openForwardMenu = Boolean(forwardMenuAnchorEl);

  const handleMenuClose = () => {
    setBackMenuAnchorEl(null);
    setForwardMenuAnchorEl(null);
  };

  const handleForwardOnClick = (event) => {
    if (historyIndex >= history.length) {
      return setHistoryIndex(history.length - 1);
    }
    if (event.type === "contextmenu") {
      event.preventDefault();
      return setForwardMenuAnchorEl(
        document.getElementById("forward-button") ?? null
      );
    }
    const progressObject = history[historyIndex + 1];
    setProgress(progressObject.spine, progressObject.part);
    setHistoryIndex(historyIndex + 1);
  };
  const handleBackOnClick = (event) => {
    if (historyIndex <= 0) {
      return;
    }
    if (event.type === "contextmenu") {
      event.preventDefault();
      return setBackMenuAnchorEl(
        document.getElementById("back-button") ?? null
      );
    }
    const progressObject = history[historyIndex - 1];
    setProgress(progressObject.spine, progressObject.part);
    setHistoryIndex(historyIndex - 1);
  };

  const handleMenuButtonOnClick = (backButtonClick, index) => {
    handleMenuClose();
    let newHistoryIndex;
    if (backButtonClick) {
      newHistoryIndex = historyIndex - (index + 1);
    } else {
      newHistoryIndex = historyIndex + (index + 1);
    }
    const progressObject = history[newHistoryIndex];
    setProgress(progressObject.spine, progressObject.part);
    setHistoryIndex(newHistoryIndex);
  };

  return (
    <>
      <Menu
        anchorEl={backMenuAnchorEl}
        open={openBackMenu}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        disableRestoreFocus={true}
      >
        {history
          .filter((_entry, index) => index < historyIndex)
          .reverse()
          .map((entry, index) => (
            <Stack key={index} sx={{ width: 300 }}>
              {index > 0 && <Divider />}
              <MenuItem onClick={() => handleMenuButtonOnClick(true, index)}>
                <Stack>
                  <Typography sx={{ textWrap: "wrap" }} variant="h6">
                    {spine[entry.spine]?.label ??
                      `Unlabeled Chapter (${entry.spine})`}
                  </Typography>
                  <Typography color="gray">{`${Math.round(entry.part * 10000) / 100}%`}</Typography>
                </Stack>
              </MenuItem>
            </Stack>
          ))}
      </Menu>
      <Menu
        anchorEl={forwardMenuAnchorEl}
        open={openForwardMenu}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        disableRestoreFocus={true}
      >
        {history
          .filter((_entry, index) => index > historyIndex)
          .map((entry, index) => (
            <Stack key={index} sx={{ width: 300 }}>
              {index > 0 && <Divider />}
              <MenuItem onClick={() => handleMenuButtonOnClick(false, index)}>
                <Stack>
                  <Typography sx={{ textWrap: "wrap" }} variant="h6">
                    {spine[entry.spine]?.label ??
                      `Unlabeled Chapter (${entry.spine})`}
                  </Typography>
                  <Typography color="gray">{`${Math.round(entry.part * 10000) / 100}%`}</Typography>
                </Stack>
              </MenuItem>
            </Stack>
          ))}
      </Menu>
      <Stack direction={"row"}>
        <Tooltip title={"Back"}>
          <span>
            <IconButton
              id="back-button"
              onClick={handleBackOnClick}
              onContextMenu={handleBackOnClick}
              disabled={historyIndex <= 0}
            >
              <ArrowBackIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={"Forward"}>
          <span>
            <IconButton
              id="forward-button"
              onClick={handleForwardOnClick}
              onContextMenu={handleForwardOnClick}
              disabled={historyIndex >= history.length - 1}
            >
              <ArrowForwardIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </>
  );
};

HistoryButtons.propTypes = {
  epubObject: PropTypes.object.isRequired,
  history: PropTypes.array.isRequired,
  historyIndex: PropTypes.number.isRequired,
  setHistoryIndex: PropTypes.func.isRequired,
  setProgress: PropTypes.func.isRequired,
};
