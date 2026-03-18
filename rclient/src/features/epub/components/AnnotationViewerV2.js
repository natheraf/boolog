import * as React from "react";
import PropTypes from "prop-types";
import {
  IconButton,
  Menu,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { AnnotationHeader } from "./AnnotationHeader";
import { AnnotationNotesList } from "./AnnotationNotesList";
import { getSortedNotes } from "../epubUtils";

export const AnnotationViewerV2 = ({
  epubObject,
  spineIndex,
  setProgress,
  setForceFocus,
}) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const width = greaterThanSmall
    ? `${Math.floor(window.innerWidth / 2)}px`
    : window.innerWidth - 32; // 16 is the menu margin gap from the window on each side
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openAnnotation = Boolean(anchorEl);
  const [tab, setTab] = React.useState("notes");
  const [sort, setSort] = React.useState({
    notes: { type: "reading_order", direction: "asc", grouped: true },
    memos: { type: "alphabetical", direction: "asc" },
  });
  const [notes, setNotes] = React.useState(null);

  const handleOpenAnnotation = (event) => {
    setNotes(getSortedNotes(sort, epubObject));
    // updatedNotes.current.clear();
    // updatedMemos.current.clear();
    // scrollToCurrentChapterSubheader();
    // setNotes(noteSort);
    // setMemoAsArray(updateMemosAsArray());
    // clearTemporaryMarks();
    setAnchorEl(event.currentTarget);
    // setExpandedNotesMap(new Map());
  };

  const handleCloseAnnotation = () => {
    setAnchorEl(null);
  };

  const setSortHelper = (value) => {
    setSort(value);
    setNotes(getSortedNotes(value, epubObject));
  };

  const goToNote = (spineIndex, id) => {
    handleCloseAnnotation();
    setProgress(spineIndex, 0);
    setForceFocus({
      type: "element",
      attributeName: "class",
      attributeValue: id,
    });
  };

  return (
    <>
      <Tooltip title="Annotations">
        <IconButton onClick={handleOpenAnnotation}>
          <TextSnippetIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={openAnnotation}
        onClose={handleCloseAnnotation}
        sx={{ width }}
      >
        <AnnotationHeader
          tab={tab}
          setTab={setTab}
          sort={sort}
          setSort={setSortHelper}
          handleCloseAnnotation={handleCloseAnnotation}
        />
        {tab === "notes" && notes && (
          <AnnotationNotesList
            epubObject={epubObject}
            spineIndex={spineIndex}
            notes={notes}
            setNotes={setNotes}
            grouped={sort.notes.grouped}
            goToNote={goToNote}
          />
        )}
      </Menu>
    </>
  );
};

AnnotationViewerV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  setProgress: PropTypes.func.isRequired,
  setForceFocus: PropTypes.func.isRequired,
};
