import * as React from "react";
import PropTypes from "prop-types";
import { AnnotationNotesGrouped } from "./AnnotationNotesGrouped";
import { putEpubData } from "../../../api/IndexedDB/epubData";
import { trimAndHighlight, updateNoteMarksOrDeleteInDOM } from "../domUtils";
import { SimpleColorPickerV2 } from "./SimpleColorPickerV2";
import { Box, Menu } from "@mui/material";
import { AnnotationNotesUngrouped } from "./AnnotationNotesUngrouped";

export const AnnotationNotesList = ({
  epubObject,
  spineIndex,
  notes,
  setNotes,
  grouped,
  goToNote,
}) => {
  const spine = epubObject.spine;
  const [expandedNotes, setExpandedNotes] = React.useState({});
  const [noteForEdit, setNoteForEdit] = React.useState(null);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = React.useState(null);
  const openColorPicker = Boolean(colorPickerAnchorEl);

  const setNoteHelper = (chapter, arrayIndex, key, value, spineIndex, id) => {
    if (grouped) {
      setNotes((prev) => ({
        ...prev,
        [chapter]: prev[chapter].map((note, index) =>
          index === arrayIndex ? { ...note, [key]: value } : note
        ),
      }));
    } else {
      setNotes((prev) =>
        prev.map((note, index) =>
          index === arrayIndex ? { ...note, [key]: value } : note
        )
      );
    }
    const epubNote = epubObject.notes[spineIndex][id];
    epubNote[key] = value;
    epubNote.dateModified = new Date().toJSON();
    putEpubData(epubNote);
  };

  const deleteNote = (note, arrayIndex) => {
    const chapter = spine[note.spineIndex].label;
    if (grouped) {
      setNotes((prev) => ({
        ...prev,
        [chapter]: prev[chapter].filter((_obj, index) => index !== arrayIndex),
      }));
    } else {
      setNotes((prev) => prev.filter((_obj, index) => index !== arrayIndex));
    }
    delete epubObject.notes[note.spineIndex][note.id];
    updateNoteMarksOrDeleteInDOM(note, true);
  };

  const handleNoteTextAreaOnChange = (note, arrayIndex) => (event) => {
    setNoteHelper(
      note.chapterLabel,
      arrayIndex,
      "note",
      event.target.value,
      note.spineIndex,
      note.id
    );
  };

  const handleExpandNote = (note) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [note.id]: trimAndHighlight(
        spine[note.spineIndex].element,
        note.selectedRangeIndexed,
        note.highlightColor,
        note.id
      ),
    }));
  };

  const handleGoToHighlight = (spineIndex, noteId) => {
    goToNote(spineIndex, noteId);
  };

  const handleOpenColorPicker = (note, arrayIndex) => (event) => {
    setNoteForEdit({ ...note, arrayIndex });
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
  };

  const setHighlightColor = (highlightColor) => {
    const newNoteForEdit = { ...noteForEdit, highlightColor };
    setNoteForEdit(newNoteForEdit);
    updateNoteMarksOrDeleteInDOM(newNoteForEdit, false);
    setNoteHelper(
      noteForEdit.chapterLabel,
      noteForEdit.arrayIndex,
      "highlightColor",
      highlightColor,
      noteForEdit.spineIndex,
      noteForEdit.id
    );
  };

  return (
    <>
      {openColorPicker && (
        <Menu
          anchorEl={colorPickerAnchorEl}
          open={openColorPicker}
          onClose={handleCloseColorPicker}
        >
          <Box sx={{ padding: 1 }}>
            <SimpleColorPickerV2
              highlightColor={noteForEdit.highlightColor}
              setHighlightColor={setHighlightColor}
            />
          </Box>
        </Menu>
      )}
      {grouped ? (
        <AnnotationNotesGrouped
          spine={spine}
          spineIndex={spineIndex}
          notes={notes}
          expandedNotes={expandedNotes}
          handleNoteTextAreaOnChange={handleNoteTextAreaOnChange}
          handleExpandNote={handleExpandNote}
          handleGoToHighlight={handleGoToHighlight}
          handleOpenColorPicker={handleOpenColorPicker}
          deleteNote={deleteNote}
        />
      ) : (
        <AnnotationNotesUngrouped
          notes={notes}
          expandedNotes={expandedNotes}
          handleNoteTextAreaOnChange={handleNoteTextAreaOnChange}
          handleExpandNote={handleExpandNote}
          handleGoToHighlight={handleGoToHighlight}
          handleOpenColorPicker={handleOpenColorPicker}
          deleteNote={deleteNote}
        />
      )}
    </>
  );
};

AnnotationNotesList.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  notes: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  setNotes: PropTypes.func.isRequired,
  grouped: PropTypes.bool.isRequired,
  goToNote: PropTypes.func.isRequired,
};
