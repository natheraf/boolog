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
import { deleteEpubData, putEpubData } from "../../../api/IndexedDB/epubData";
import {
  changePermanentMarksToTemporary,
  changeTemporaryMarksToPermanent,
} from "../domUtils";
import { getNewId } from "../../../api/IndexedDB/common";

export const AnnotatorNotes = ({
  epubObject,
  spineIndex,
  selectedText,
  anchorEl,
  setAnchorEl,
  selectedRangeIndexed,
  abortController,
  anchorToElementWithClass,
}) => {
  const noteIdAttribute = "noteid";
  const date = new Date().toJSON();
  const noteId = React.useRef(
    anchorEl?.getAttribute(noteIdAttribute) ?? getNewId()
  );
  const entryId = epubObject.key;
  const notes = epubObject.notes;
  const [note, setNote] = React.useState(
    notes[spineIndex]?.[noteId.current]?.note ?? ""
  );
  const [highlightColor, setHighlightColor] = React.useState(
    notes[spineIndex]?.[noteId.current]?.highlightColor ?? null
  );
  const [copySuccess, setCopySuccess] = React.useState(false);
  const copySuccessTimeout = React.useRef(null);
  const [showNotesHelp, setShowNotesHelp] = React.useState(false);

  const setNoteHelper = (value) => {
    if (notes.hasOwnProperty(spineIndex) === false) {
      notes[spineIndex] = {};
    }
    if (notes[spineIndex].hasOwnProperty(noteId.current) === false) {
      notes[spineIndex][noteId.current] = { highlightColor: null, note: "" };
    }
    notes[spineIndex][noteId.current].note = value;
    setNote(value);
    handleSave();
  };

  const setHighlightColorHelper = (value) => {
    if (notes.hasOwnProperty(spineIndex) === false) {
      notes[spineIndex] = {};
    }
    if (notes[spineIndex].hasOwnProperty(noteId.current) === false) {
      notes[spineIndex][noteId.current] = { highlightColor: null, note: "" };
    }
    notes[spineIndex][noteId.current].highlightColor = value;
    setHighlightColor(value);
    handleSave();
  };

  const handleClear = () => {
    setNoteHelper("");
    setHighlightColorHelper(null);
  };

  const handleTextAreaOnChange = (event) => {
    setNoteHelper(event?.target?.value ?? "");
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

  const handleUpdateHighlight = (noteId, highlightColor) => {
    const marks = document.getElementsByClassName(noteId);
    for (const mark of marks) {
      mark.setAttribute(
        "style",
        `background-color: ${highlightColor} !important;`
      );
    }
  };

  const handleTemporaryMarksAndAddingClickListeners = (noteId) => {
    const marks = [...document.getElementsByClassName("temporary-mark")];
    if (marks.length === 0) {
      return;
    }
    changeTemporaryMarksToPermanent(marks, noteId);
    const markOnClick = (noteId) => (event) => {
      event.stopPropagation();
      if (window.getSelection().isCollapsed) {
        anchorToElementWithClass(noteId);
      }
    };
    for (const mark of marks) {
      mark.addEventListener("click", markOnClick(noteId), {
        signal: abortController.current.signal,
      });
    }
  };

  const handleSave = () => {
    const noteid = noteId.current;
    if (
      !noteid ||
      !notes.hasOwnProperty(spineIndex) ||
      !notes[spineIndex].hasOwnProperty(noteid)
    ) {
      return;
    }
    const note = notes[spineIndex][noteid].note ?? "";
    const highlightColor = notes[spineIndex][noteid].highlightColor ?? null;
    if (note.length > 0 || highlightColor !== null) {
      handleTemporaryMarksAndAddingClickListeners(noteid);
      if (!notes[spineIndex][noteid].hasOwnProperty("dateCreated")) {
        notes[spineIndex][noteid] = {
          ...notes[spineIndex][noteid],
          key: `${entryId}.notes.${spineIndex}.${noteid}`,
          entryId,
          spineIndex,
          selectedText,
          dateCreated: date,
          selectedRangeIndexed: selectedRangeIndexed.current,
        };
      }
      notes[spineIndex][noteid].dateModified = date;
      handleUpdateHighlight(noteid, highlightColor);
      putEpubData(notes[spineIndex][noteid]);
    } else {
      if (notes[spineIndex][noteid].hasOwnProperty("key")) {
        deleteEpubData(notes[spineIndex][noteid]);
      }
      delete notes[spineIndex][noteid];
      changePermanentMarksToTemporary(noteid);
    }
  };

  React.useEffect(() => {
    const textArea = document.getElementById("annotator-text-area");
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
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
        setHighlightColor={setHighlightColorHelper}
      />
    </Stack>
  );
};

AnnotatorNotes.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  selectedText: PropTypes.string.isRequired,
  anchorEl: PropTypes.object.isRequired,
  setAnchorEl: PropTypes.func.isRequired,
  selectedRangeIndexed: PropTypes.object,
  abortController: PropTypes.object.isRequired,
  anchorToElementWithClass: PropTypes.func.isRequired,
};
