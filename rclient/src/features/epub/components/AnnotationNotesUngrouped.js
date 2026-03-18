import PropTypes from "prop-types";
import { Stack } from "@mui/material";
import { AnnotationViewerNoteEntry } from "./AnnotationViewerNoteEntry";

export const AnnotationNotesUngrouped = ({
  notes,
  expandedNotes,
  handleNoteTextAreaOnChange,
  handleExpandNote,
  handleGoToHighlight,
  handleOpenColorPicker,
  deleteNote,
}) => {
  return (
    <Stack spacing={2} sx={{ padding: 2 }}>
      {notes.map((note, arrayIndex) => (
        <AnnotationViewerNoteEntry
          key={note.id}
          note={note}
          expandedNotes={expandedNotes}
          arrayIndex={arrayIndex}
          handleNoteTextAreaOnChange={handleNoteTextAreaOnChange}
          handleExpandNote={handleExpandNote}
          handleGoToHighlight={handleGoToHighlight}
          handleOpenColorPicker={handleOpenColorPicker}
          deleteNote={deleteNote}
        />
      ))}
    </Stack>
  );
};

AnnotationNotesUngrouped.propTypes = {
  notes: PropTypes.array.isRequired,
  expandedNotes: PropTypes.object.isRequired,
  handleNoteTextAreaOnChange: PropTypes.func.isRequired,
  handleExpandNote: PropTypes.func.isRequired,
  handleGoToHighlight: PropTypes.func.isRequired,
  handleOpenColorPicker: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
};
