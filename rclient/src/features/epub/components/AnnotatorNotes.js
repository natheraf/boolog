import * as React from "react";
import PropTypes from "prop-types";
import { Divider, Stack, Typography } from "@mui/material";
import { HtmlTooltip } from "../../CustomComponents";
import { Textarea } from "../../../components/Textarea";
import { SimpleColorPickerV2 } from "./SimpleColorPickerV2";
import { deleteEpubData, putEpubData } from "../../../api/IndexedDB/epubData";
import {
  changePermanentMarksToTemporary,
  changeTemporaryMarksToPermanent,
} from "../domUtils";
import { getNewId } from "../../../api/IndexedDB/common";
import { AnnotatorHeader } from "./AnnotatorHeader";

export const AnnotatorNotes = ({
  epubObject,
  spineIndex,
  selectedText,
  anchorEl,
  selectedRangeIndexed,
  attachContextMenuListenersToMarks,
  formatting,
}) => {
  const noteIdAttribute = "noteid";
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
  const [canClear, setCanClear] = React.useState(
    note.length > 0 || highlightColor !== null
  );

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

  const setHighlightSampleBackground = (highlightColor) => {
    const highlightSample = document.getElementById("highlight-sample");
    highlightSample.style.setProperty(
      "background-color",
      highlightColor,
      "important"
    );
  };

  const setHighlightColorHelper = (value) => {
    if (notes.hasOwnProperty(spineIndex) === false) {
      notes[spineIndex] = {};
    }
    if (notes[spineIndex].hasOwnProperty(noteId.current) === false) {
      notes[spineIndex][noteId.current] = { highlightColor: null, note: "" };
    }
    setHighlightSampleBackground(value);
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
    attachContextMenuListenersToMarks(
      noteId,
      selectedText,
      selectedRangeIndexed.current
    );
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
    const date = new Date().toJSON();
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
      setCanClear(true);
    } else {
      if (notes[spineIndex][noteid].hasOwnProperty("key")) {
        deleteEpubData(notes[spineIndex][noteid]);
      }
      delete notes[spineIndex][noteid];
      changePermanentMarksToTemporary(noteid);
      setCanClear(false);
    }
  };

  React.useEffect(() => {
    setHighlightSampleBackground(highlightColor);
    const textArea = document.getElementById("annotator-text-area");
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
  }, []);

  return (
    <Stack
      id="annotator-body"
      sx={{
        width: "100%",
        padding: 1,
      }}
      spacing={1}
    >
      <AnnotatorHeader
        selectedText={selectedText}
        canClear={canClear}
        handleClear={handleClear}
        tab={"notes"}
      />
      <Divider />
      <HtmlTooltip
        title={<Typography variant="subtitle2">{selectedText}</Typography>}
        placement="right"
        enterDelay={200}
        enterNextDelay={200}
      >
        <Stack
          direction={"row"}
          sx={{
            overflow: "hidden",
            width: "100%",
            backgroundColor: formatting.pageColor,
            color: formatting.textColor,
          }}
        >
          <Typography
            sx={{
              zIndex: 2 /** to show above simple color picker backdrop */,
              padding: 1,
            }}
            variant="h6"
            noWrap
          >
            <span id="highlight-sample">{selectedText}</span>
          </Typography>
        </Stack>
      </HtmlTooltip>
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
  selectedRangeIndexed: PropTypes.object,
  attachContextMenuListenersToMarks: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
};
