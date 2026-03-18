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

export const AnnotationViewerV2 = ({ epubObject, spineIndex }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const width = greaterThanSmall
    ? `${Math.floor(window.innerWidth / 2)}px`
    : window.innerWidth - 32; // 16 is the menu margin gap from the window on each side
  const notes = epubObject.notes;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openAnnotation = Boolean(anchorEl);

  const [tab, setTab] = React.useState("notes");
  const [sort, setSort] = React.useState({
    notes: { type: "reading_order", direction: "asc", grouped: true },
    memos: { type: "alphabetical", direction: "asc" },
  });

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
          setSort={setSort}
          handleCloseAnnotation={handleCloseAnnotation}
        />
        {tab === "notes" && (
          <AnnotationNotesList
            epubObject={epubObject}
            spineIndex={spineIndex}
            sort={sort}
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
