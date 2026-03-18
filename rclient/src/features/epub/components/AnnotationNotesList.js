import * as React from "react";
import PropTypes from "prop-types";
import { AnnotationNotesGrouped } from "./AnnotationNotesGrouped";

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

export const AnnotationNotesList = ({ epubObject, spineIndex, sort }) => {
  const epubNotes = epubObject.notes;
  const spine = epubObject.spine;
  const sortType = sort.notes.type;
  const sortDirection = sort.notes.direction;
  const sortGrouped = sort.notes.grouped;
  const sortTypeToNoteKey = {
    date_modified: "dateModified",
    date_created: "dateCreated",
  };
  const getSortNotes = () => {
    if (sortGrouped) {
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
    } else if (!sortGrouped) {
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
    }
  };
  const [notes, setNotes] = React.useState(() => getSortNotes());
  const [expandedNotes, setExpandedNotes] = React.useState(new Map());

  return (
    sortGrouped && (
      <AnnotationNotesGrouped
        spine={spine}
        spineIndex={spineIndex}
        notes={notes}
        expandedNotes={expandedNotes}
      />
    )
  );
};

AnnotationNotesList.propTypes = {};
