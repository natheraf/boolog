import * as React from "react";
import PropTypes from "prop-types";
import {
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { HtmlTooltip } from "../../CustomComponents";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import HelpIcon from "@mui/icons-material/Help";

export const AnnotatorHeader = ({
  selectedText,
  canClear,
  handleClear,
  tab,
}) => {
  const tabNames = { notes: "Notes", memos: "Memos" };
  const helpHTMLTooltips = {
    memos: (
      <Stack spacing={1}>
        <Typography variant="h6">{"Memos"}</Typography>
        <Typography variant="subtitle2">
          {"Memos appear in every occurrence of a word/phrase"}
        </Typography>
        <Divider />
        <Typography>{"Usage"}</Typography>
        <Typography variant="subtitle2">
          {
            "Jot down something to remind yourself of a character, place, or thing. Whenever you highlight this again, this memo will appear."
          }
        </Typography>
      </Stack>
    ),
    notes: (
      <Stack spacing={1}>
        <Typography variant="h6">{"Notes"}</Typography>
        <Typography variant="subtitle2">{"Can be left empty."}</Typography>
        <Divider />
        <Typography>{"Highlight"}</Typography>
        <Typography variant="subtitle2">
          {
            "If no highlight color is selected and a note is written, the highlight will be transparent."
          }
        </Typography>
      </Stack>
    ),
  };
  const [showHelp, setShowHelp] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const copySuccessTimeout = React.useRef(null);

  const handleOnClickHelp = () => {
    setShowHelp((prev) => !prev);
  };

  const handleCopySelectedText = () => {
    setCopySuccess(true);
    navigator.clipboard.writeText(selectedText);
    clearTimeout(copySuccessTimeout.current);
    copySuccessTimeout.current = setTimeout(() => setCopySuccess(false), 1000);
  };

  const handleOnKeyDown = (event) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const notSelectingText =
      window.getSelection()?.toString()?.trim()?.length === 0;
    if (isCtrlOrCmd && event.key === "c" && notSelectingText) {
      handleCopySelectedText();
    }
  };

  React.useEffect(() => {
    const annotatorNodes = document.getElementById("annotator-body");
    annotatorNodes.addEventListener("keydown", handleOnKeyDown);
    return () => {
      annotatorNodes.removeEventListener("keydown", handleOnKeyDown);
    };
  }, []);

  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <HtmlTooltip
        title={helpHTMLTooltips[tab]}
        open={showHelp}
        placement="top"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5">{tabNames[tab]}</Typography>
          <IconButton size="small" onClick={handleOnClickHelp}>
            <HelpIcon fontSize="small" htmlColor={"gray"} />
          </IconButton>
        </Stack>
      </HtmlTooltip>
      <Stack direction={"row"} alignItems={"center"}>
        <Tooltip placement="top" title={"Copy Selected Text (ctrl + c)"}>
          <IconButton onClick={handleCopySelectedText}>
            {copySuccess ? (
              <Zoom in={true} timeout={500}>
                <CheckIcon fontSize="small" />
              </Zoom>
            ) : (
              <CopyAllIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        {canClear ? (
          <Tooltip placement="top" title={"Clear"}>
            <IconButton onClick={handleClear}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton disabled>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

AnnotatorHeader.propTypes = {
  selectedText: PropTypes.string.isRequired,
  canClear: PropTypes.bool.isRequired,
  handleClear: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
};
