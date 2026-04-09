import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { AnnotationHeader } from "./AnnotationHeader";
import { AnnotationNotesList } from "./AnnotationNotesList";
import { getSortedMemos, getSortedNotes } from "../epubUtils";
import { AnnotationMemosList } from "./AnnotationMemosList";
import { deleteEpubData } from "../../../api/IndexedDB/epubData";
import { deleteNodesAndLiftChildren } from "../domUtils";
import { DynamicMenuAndDialog } from "../../CustomComponents";

export const AnnotationViewerV2 = ({
  epubObject,
  spineIndex,
  setProgress,
  setForceFocus,
  clearHeaderHideTimeoutId,
}) => {
  const epubMemos = epubObject.memos;
  const epubNotes = epubObject.notes;
  const theme = useTheme();
  const greaterThanMedium = useMediaQuery(theme.breakpoints.up("md"));
  const width = greaterThanMedium
    ? `${Math.min(700, Math.floor(window.innerWidth / 2))}px`
    : window.innerWidth - 48; // 24 is the menu margin gap from the window on each side
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openAnnotation = Boolean(anchorEl);
  const [tab, setTab] = React.useState("notes");
  const [sort, setSort] = React.useState({
    notes: { type: "reading_order", direction: "asc", grouped: true },
    memos: { type: "alphabetical", direction: "asc" },
  });
  const [notes, setNotes] = React.useState(null);
  const [memos, setMemos] = React.useState(null);
  const [emptyMemos, setEmptyMemos] = React.useState([]);
  const [emptyNotes, setEmptyNotes] = React.useState([]);

  const handleOpenAnnotation = (event) => {
    clearHeaderHideTimeoutId();
    setNotes(getSortedNotes(sort, epubObject));
    setMemos(getSortedMemos(sort, epubObject));
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAnnotation = () => {
    emptyMemos.forEach((memoKey) => {
      deleteEpubData(epubMemos[memoKey]);
      delete epubMemos[memoKey];
    });
    setEmptyMemos([]);
    emptyNotes.forEach((entry) => {
      deleteEpubData(epubNotes[entry.spineIndex][entry.id]);
      delete epubNotes[entry.spineIndex][entry.id];
      deleteNodesAndLiftChildren(document.getElementsByClassName(entry.id));
    });
    setEmptyNotes([]);
    setAnchorEl(null);
  };

  const setSortHelper = (value) => {
    setSort(value);
    if (tab === "notes") {
      setNotes(getSortedNotes(value, epubObject));
    } else if (tab === "memos") {
      setMemos(getSortedMemos(value, epubObject));
    }
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

  const listComponent = (tab, notes, memos) => {
    if (tab === "notes" && notes) {
      return (
        <AnnotationNotesList
          epubObject={epubObject}
          spineIndex={spineIndex}
          notes={notes}
          setNotes={setNotes}
          grouped={sort.notes.grouped}
          goToNote={goToNote}
          setEmptyNotes={setEmptyNotes}
        />
      );
    } else if (tab === "memos" && memos) {
      return (
        <AnnotationMemosList
          epubObject={epubObject}
          memos={memos}
          setMemos={setMemos}
          setEmptyMemos={setEmptyMemos}
        />
      );
    }
  };

  return (
    <>
      <Tooltip title="Annotations">
        <IconButton onClick={handleOpenAnnotation}>
          <TextSnippetIcon />
        </IconButton>
      </Tooltip>
      <DynamicMenuAndDialog
        anchorEl={anchorEl}
        open={openAnnotation}
        onClose={handleCloseAnnotation}
      >
        <Box sx={{ width: "100%" }}>
          <AnnotationHeader
            tab={tab}
            setTab={setTab}
            sort={sort}
            setSort={setSortHelper}
            handleCloseAnnotation={handleCloseAnnotation}
          />
          {listComponent(tab, notes, memos)}
        </Box>
      </DynamicMenuAndDialog>
    </>
  );
};

AnnotationViewerV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  setProgress: PropTypes.func.isRequired,
  setForceFocus: PropTypes.func.isRequired,
  clearHeaderHideTimeoutId: PropTypes.func.isRequired,
};
