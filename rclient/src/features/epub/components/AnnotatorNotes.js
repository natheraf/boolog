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
import { Textarea } from "../../../components/Textarea";
import CheckIcon from "@mui/icons-material/Check";
import HelpIcon from "@mui/icons-material/Help";
import { SimpleColorPickerV2 } from "./SimpleColorPickerV2";

export const AnnotatorNotes = ({ selectedText }) => {
  const [note, setNote] = React.useState("");
  const [highlightColor, setHighlightColor] = React.useState(null);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const copySuccessTimeout = React.useRef(null);
  const [showNotesHelp, setShowNotesHelp] = React.useState(false);

  const handleClear = () => {
    setNote("");
    setHighlightColor(null);
  };

  const handleTextAreaOnChange = (event) => {
    setNote(event?.target?.value ?? "");
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

  const handleOnClickNotesHelp = () => {
    setShowNotesHelp((prev) => !prev);
  };

  React.useEffect(() => {
    const textArea = document.getElementById("annotator-text-area");
    textArea.focus();
    const annotatorNodes = document.getElementById("annotator-notes");
    annotatorNodes.addEventListener("keydown", handleOnKeyDown);
    return () => {
      annotatorNodes.removeEventListener("keydown", handleOnKeyDown);
    };
  }, []);

  return (
    <Stack
      id="annotator-notes"
      sx={{
        width: "100%",
        padding: 1,
      }}
      spacing={1}
    >
      <Stack direction={"row"} justifyContent={"space-between"}>
        <HtmlTooltip
          title={
            <Stack spacing={1}>
              <Typography variant="h6">{"Notes"}</Typography>
              <Typography variant="subtitle2">
                {"Can be left empty."}
              </Typography>
              <Divider />
              <Typography>{"Highlight"}</Typography>
              <Typography variant="subtitle2">
                {
                  "If no highlight color is selected and a note is written, the highlight will be transparent."
                }
              </Typography>
            </Stack>
          }
          open={showNotesHelp}
          placement="top"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5">Notes</Typography>
            <IconButton size="small" onClick={handleOnClickNotesHelp}>
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
          {note.length > 0 || highlightColor ? (
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
      <Divider />
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <HtmlTooltip
          title={<Typography variant="subtitle2">{selectedText}</Typography>}
          placement="right"
          enterDelay={200}
          enterNextDelay={200}
        >
          <Typography variant="h6" noWrap>
            {selectedText}
          </Typography>
        </HtmlTooltip>
      </Stack>
      <Divider />
      <Textarea
        id="annotator-text-area"
        value={note}
        onChange={handleTextAreaOnChange}
        onKeyDown={(event) => event.stopPropagation()}
        sx={{
          [`&:focus`]: { boxShadow: "inherit", borderColor: `inherit` },
          [`&:hover:focus`]: {
            borderColor: `inherit`,
          },
        }}
        minRows={3}
      />
      <SimpleColorPickerV2
        highlightColor={highlightColor}
        setHighlightColor={setHighlightColor}
      />
      {/* {tabValueMap[currentTabValue] === "note" && (
            <SimpleColorPicker
              color={highlightColor}
              handleRadioOnClick={handleHighlightColorClick}
              handleRadioChange={handleHighlightColorChange(false)}
              handleTextFieldChange={handleHighlightColorChange(true)}
            />
          )} */}
    </Stack>
  );
};

AnnotatorNotes.propTypes = {};
