import * as React from "react";
import PropTypes from "prop-types";
import { IconButton, Stack, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const HistoryButtons = ({
  history,
  historyIndex,
  setHistoryIndex,
  setProgress,
}) => {
  const handleForwardOnClick = () => {
    if (historyIndex >= history.length) {
      return setHistoryIndex(history.length - 1);
    }
    const progressObject = history[historyIndex + 1];
    setProgress(progressObject.spine, progressObject.part, true);
    setHistoryIndex(historyIndex + 1);
  };
  const handleBackOnClick = () => {
    if (historyIndex <= 0) {
      return;
    }
    const progressObject = history[historyIndex - 1];
    setProgress(progressObject.spine, progressObject.part, true);
    setHistoryIndex(historyIndex - 1);
  };

  return (
    <Stack direction={"row"}>
      <Tooltip title={"Back (q)"}>
        <span>
          <IconButton onClick={handleBackOnClick} disabled={historyIndex <= 0}>
            <ArrowBackIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={"Forward (e)"}>
        <span>
          <IconButton
            onClick={handleForwardOnClick}
            disabled={historyIndex >= history.length - 1}
          >
            <ArrowForwardIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};

HistoryButtons.propTypes = {
  history: PropTypes.array.isRequired,
  historyIndex: PropTypes.number.isRequired,
  setHistoryIndex: PropTypes.func.isRequired,
  setProgress: PropTypes.func.isRequired,
};
