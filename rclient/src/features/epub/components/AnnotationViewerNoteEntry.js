import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Textarea } from "../../../components/Textarea";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LinkIcon from "@mui/icons-material/Link";
import PaletteIcon from "@mui/icons-material/Palette";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatesInARow } from "../../CustomComponents";

export const AnnotationViewerNoteEntry = ({
  note,
  expandedNotes,
  arrayIndex,
  handleNoteTextAreaOnChange,
  handleExpandNote,
  handleGoToHighlight,
  handleOpenColorPicker,
  deleteNote,
}) => {
  return (
    <Paper key={note.id} elevation={24} sx={{ padding: 1 }}>
      <Stack spacing={1}>
        <DatesInARow entry={note} />
        {expandedNotes.hasOwnProperty(note.id) ? (
          <Box
            sx={{ overflowX: "auto" }}
            dangerouslySetInnerHTML={{
              __html: expandedNotes[note.id] ?? "something went wrong...",
            }}
          />
        ) : (
          <Typography>
            <span
              style={{
                backgroundColor: note.highlightColor,
              }}
            >
              {note.selectedText}
            </span>
          </Typography>
        )}
        <Stack sx={{ width: "100%" }}>
          <Typography color="lightgray" variant="body">
            Note
          </Typography>
          <Textarea
            value={note.note}
            onChange={handleNoteTextAreaOnChange(note, arrayIndex)}
            onKeyDown={(event) => {
              event.stopPropagation();
            }}
            sx={{
              [`&:focus`]: {
                boxShadow: "inherit",
                borderColor: `inherit`,
              },
              [`&:hover:focus`]: {
                borderColor: `inherit`,
              },
            }}
            minRows={1}
          />
        </Stack>
        <Stack spacing={1} direction="row">
          <Tooltip title="Preview">
            <IconButton
              onClick={() => handleExpandNote(note)}
              size="small"
              disabled={expandedNotes.hasOwnProperty(note.id)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Go to location">
            <IconButton
              onClick={() => handleGoToHighlight(note.spineIndex, note.id)}
              size="small"
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Change Color">
            <IconButton
              onClick={handleOpenColorPicker(note, arrayIndex)}
              size="small"
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => deleteNote(note, arrayIndex)}
              size="small"
              className={"note-delete-button"}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

AnnotationViewerNoteEntry.propTypes = {
  note: PropTypes.object.isRequired,
  expandedNotes: PropTypes.object.isRequired,
  arrayIndex: PropTypes.number.isRequired,
  handleNoteTextAreaOnChange: PropTypes.func.isRequired,
  handleExpandNote: PropTypes.func.isRequired,
  handleGoToHighlight: PropTypes.func.isRequired,
  handleOpenColorPicker: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
};
