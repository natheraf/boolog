import * as React from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Textarea } from "../../../components/Textarea";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LinkIcon from "@mui/icons-material/Link";
import PaletteIcon from "@mui/icons-material/Palette";
import DeleteIcon from "@mui/icons-material/Delete";

const DatesInARow = ({ entry }) => {
  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      {entry.dateModified && (
        <Typography variant="subtitle2" color="gray">
          {`Modified: ${new Date(entry.dateModified).toLocaleString(undefined, {
            timeStyle: "short",
            dateStyle: "short",
          })}`}
        </Typography>
      )}
      {entry.dateCreated && (
        <Typography variant="subtitle2" color="gray">
          {`Created: ${new Date(entry.dateCreated).toLocaleString(undefined, {
            timeStyle: "short",
            dateStyle: "short",
          })}`}
        </Typography>
      )}
    </Stack>
  );
};

export const AnnotationNotesGrouped = ({
  spine,
  spineIndex,
  notes,
  expandedNotes,
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
            <Paper key={note.id} elevation={24} sx={{ padding: 1 }}>
              <Stack spacing={1}>
                <DatesInARow entry={note} />
                {expandedNotes.has(note.id) ? (
                  <Box
                    sx={{ overflowX: "auto" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        expandedNotes.get(note.id) ?? "something went wrong...",
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
                  <Typography variant="body">Note</Typography>
                  <Textarea
                    value={note.note}
                    // onChange={handleNoteTextAreaOnChange(
                    //   note,
                    //   note.id,
                    //   arrayIndex
                    // )}
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
                      // onClick={() => handleExpandNote(note)}
                      size="small"
                      disabled={expandedNotes.has(note.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Go to location">
                    <IconButton
                      // onClick={() =>
                      //   handleGoToHighlight(note.spineIndex, note.id)
                      // }
                      size="small"
                    >
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Change Color">
                    <IconButton
                      // onClick={handleOpenColorPicker(note, note.id, arrayIndex)}
                      size="small"
                    >
                      <PaletteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      // onClick={() =>
                      //   updateNoteMarksOrDeleteInDOM(
                      //     note,
                      //     note.id,
                      //     true,
                      //     arrayIndex
                      //   )
                      // }
                      size="small"
                      className={"note-delete-button"}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
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
};
