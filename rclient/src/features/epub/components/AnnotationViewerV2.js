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

const readingOrderComparator = (dir) => (a, b) =>
  dir === "asc"
    ? Number.parseInt(a.selectedRangeIndexed.startContainerId) -
        Number.parseInt(b.selectedRangeIndexed.startContainerId) ||
      Number.parseInt(a.selectedRangeIndexed.startOffset) -
        Number.parseInt(b.selectedRangeIndexed.startOffset)
    : Number.parseInt(b.selectedRangeIndexed.endContainerId) -
        Number.parseInt(a.selectedRangeIndexed.endContainerId) ||
      Number.parseInt(b.selectedRangeIndexed.endOffset) -
        Number.parseInt(a.selectedRangeIndexed.endOffset);

const dateComparator = (key, dir) => (a, b) =>
  dir === "asc"
    ? Date.parse(a[key]) - Date.parse(b[key])
    : Date.parse(b[key]) - Date.parse(a[key]);

export const AnnotationViewerV2 = ({ epubObject, spineIndex }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const width = greaterThanSmall
    ? `${Math.floor(window.innerWidth / 2)}px`
    : window.innerWidth - 32; // 16 is the menu margin gap from the window on each side
  const epubNotes = epubObject.notes;
  const spine = epubObject.spine;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openAnnotation = Boolean(anchorEl);
  const [tab, setTab] = React.useState("notes");
  const [sort, setSort] = React.useState({
    notes: { type: "reading_order", direction: "asc", grouped: true },
    memos: { type: "alphabetical", direction: "asc" },
  });
  const getSortedGroupedNotes = (sort) => {
    const sortType = sort.notes.type;
    const sortDirection = sort.notes.direction;
    const sortTypeToNoteKey = {
      date_modified: "dateModified",
      date_created: "dateCreated",
    };
    const res = {};
    let prevChapter = null;
    for (const chapterNodes of Object.values(epubNotes)) {
      for (const [noteId, note] of Object.entries(chapterNodes)) {
        const chapterLabel = spine[note.spineIndex].label;
        if (prevChapter !== spine[note.spineIndex].label) {
          res[chapterLabel] = [];
        }
        prevChapter = chapterLabel;
        note.id = noteId;
        note.chapterLabel = chapterLabel;
        res[chapterLabel].push(note);
      }
    }
    if (sortType === "reading_order") {
      Object.values(res).forEach((list) =>
        list.sort(readingOrderComparator(sortDirection))
      );
    } else {
      Object.values(res).forEach((list) =>
        list.sort(dateComparator(sortTypeToNoteKey[sortType], sortDirection))
      );
    }
    return res;
  };
  const getSortedUngroupedNotes = (sort) => {
    const sortType = sort.notes.type;
    const sortDirection = sort.notes.direction;
    const sortTypeToNoteKey = {
      date_modified: "dateModified",
      date_created: "dateCreated",
    };
    const res = [];
    for (const chapterNodes of Object.values(epubNotes)) {
      for (const [noteId, note] of Object.entries(chapterNodes)) {
        const chapterLabel = spine[note.spineIndex].label;
        note.id = noteId;
        note.chapterLabel = chapterLabel;
        res.push(note);
      }
    }
    if (sortType === "reading_order") {
      res.sort(readingOrderComparator(sortDirection));
    } else {
      res.sort(dateComparator(sortTypeToNoteKey[sortType], sortDirection));
    }
    return res;
  };
  const getSortedNotes = (sort) => {
    const sortGrouped = sort.notes.grouped;
    if (sortGrouped) {
      return getSortedGroupedNotes(sort);
    } else {
      return getSortedUngroupedNotes(sort);
    }
  };
  const [notes, setNotes] = React.useState(() => getSortedNotes(sort));

  const setSortHelper = (value) => {
    setSort(value);
    setNotes(getSortedNotes(value));
  };

  const handleOpenAnnotation = (event) => {
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
        {tab === "notes" && (
          <AnnotationNotesList
            epubObject={epubObject}
            spineIndex={spineIndex}
            notes={notes}
            grouped={sort.notes.grouped}
          />
        )}
      </Menu>
    </>
  );
};

AnnotationViewerV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
};
