import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  Menu,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { AnnotationHeader } from "./AnnotationHeader";
import { AnnotationNotesList } from "./AnnotationNotesList";
import { getSortedMemos, getSortedNotes } from "../epubUtils";
import { AnnotationMemosList } from "./AnnotationMemosList";

export const AnnotationViewerV2 = ({
  epubObject,
  spineIndex,
  setProgress,
  setForceFocus,
}) => {
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

  const handleOpenAnnotation = (event) => {
    setNotes(getSortedNotes(sort, epubObject));
    setMemos(getSortedMemos(sort, epubObject));
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAnnotation = () => {
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
        />
      );
    } else if (tab === "memos" && memos) {
      return (
        <AnnotationMemosList
          epubObject={epubObject}
          memos={memos}
          setMemos={setMemos}
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
      <Menu
        anchorEl={anchorEl}
        open={openAnnotation}
        onClose={handleCloseAnnotation}
      >
        <Box sx={{ width }}>
          <AnnotationHeader
            tab={tab}
            setTab={setTab}
            sort={sort}
            setSort={setSortHelper}
            handleCloseAnnotation={handleCloseAnnotation}
          />
          {listComponent(tab, notes, memos)}
        </Box>
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
