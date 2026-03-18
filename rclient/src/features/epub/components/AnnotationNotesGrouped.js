import PropTypes from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AnnotationViewerNoteEntry } from "./AnnotationViewerNoteEntry";

export const AnnotationNotesGrouped = ({
  spine,
  spineIndex,
  notes,
  expandedNotes,
  handleNoteTextAreaOnChange,
  handleExpandNote,
  handleGoToHighlight,
  handleOpenColorPicker,
  deleteNote,
}) => {
  const currentChapter = spine[spineIndex].label;
  const chapterNameToElementId = (chapterName) =>
    `chapter-name-${chapterName.toLowerCase().split(" ").join("-")}`;

  return Object.entries(notes).map(([chapterName, chapterNotes]) => (
    <Accordion
      key={chapterName}
      id={chapterNameToElementId(chapterName)}
      defaultExpanded={chapterName === currentChapter}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          sx={{
            fontWeight: chapterName === currentChapter ? "bold" : "unset",
          }}
          component="span"
        >
          {chapterName}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {chapterNotes.map((note, arrayIndex) => (
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
      </AccordionDetails>
    </Accordion>
  ));
};

AnnotationNotesGrouped.propTypes = {
  spine: PropTypes.array.isRequired,
  spineIndex: PropTypes.number.isRequired,
  notes: PropTypes.object.isRequired,
  expandedNotes: PropTypes.object.isRequired,
  handleNoteTextAreaOnChange: PropTypes.func.isRequired,
  handleExpandNote: PropTypes.func.isRequired,
  handleGoToHighlight: PropTypes.func.isRequired,
  handleOpenColorPicker: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
};
