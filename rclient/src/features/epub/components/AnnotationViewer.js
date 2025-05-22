import * as React from "react";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { HtmlTooltip, SmallTab, SmallTabs } from "../../CustomComponents";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import NotesIcon from "@mui/icons-material/Notes";
import PropTypes from "prop-types";
import { Textarea } from "../../../components/Textarea";
import { useTheme } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import { deleteEpubData, putEpubData } from "../../../api/IndexedDB/epubData";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import PaletteIcon from "@mui/icons-material/Palette";
import { SimpleColorPicker } from "./SimpleColorPicker";
import { disableHighlightNodes } from "../domUtils";

const LastModified = ({ entry }) => {
  return (
    <Tooltip
      enterDelay={300}
      enterNextDelay={300}
      placement={"top"}
      title={`Created: ${new Date(entry.dateCreated).toLocaleString(undefined, {
        timeStyle: "short",
        dateStyle: "short",
      })}`}
    >
      <Typography variant="subtitle2" color="gray">
        {`Modified: ${new Date(entry.dateModified).toLocaleString(undefined, {
          timeStyle: "short",
          dateStyle: "short",
        })}`}
      </Typography>
    </Tooltip>
  );
};

export const AnnotationViewer = ({
  spine,
  entryId,
  clearTemporaryMarks,
  notes,
  memos,
  currentSpineIndex,
  goToNote,
}) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const tabPanelHeight = "100%";
  const appBarHeight = 58;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openAnnotation = Boolean(anchorEl);
  const [currentTabValue, setCurrentTabValue] = React.useState(0);
  const tabValueMap = ["notes", "memos"];
  const [notesAsMap, setNotesAsMap] = React.useState({});
  const [memosAsArray, setMemoAsArray] = React.useState([]);
  const updatedNotes = React.useRef(new Set());
  const updatedMemos = React.useRef(new Set());
  const currentChapterSubheaderRef = React.useRef(null);
  const scrollIntoViewObserver = React.useRef(null);
  const [colorPickAnchorEl, setColorPickAnchorEl] = React.useState(null);
  const openColorPicker = Boolean(colorPickAnchorEl);
  const [dataForColorPicker, setDataForColorPicker] = React.useState(null);
  const saveTimeOutId = React.useRef(null);
  const saveCountDownRef = React.useRef(0);
  const [saveCountDown, setSaveCountDown] = React.useState(0);
  const [memoSort, setMemoSort] = React.useState("alphabetical_inc");
  const [noteSort, setNoteSort] = React.useState("date_modified_dec");
  const [noteSortWithChapters, setNoteSortWithChapters] = React.useState(true);
  const noteSortWithChaptersRef = React.useRef(true);

  const deleteNotesHelper = (chapter, arrayIndex) => {
    if (noteSortWithChapters) {
      setNotesAsMap((prev) => ({
        ...prev,
        [chapter]: prev[chapter].filter((_obj, index) => index !== arrayIndex),
      }));
    } else {
      setNotesAsMap((prev) =>
        prev.filter((_obj, index) => index !== arrayIndex)
      );
    }
  };

  const setNoteValueHelper = (chapter, arrayIndex, key, value) => {
    if (noteSortWithChapters) {
      setNotesAsMap((prev) => ({
        ...prev,
        [chapter]: prev[chapter].map((obj, index) =>
          index === arrayIndex ? { ...obj, [key]: value } : obj
        ),
      }));
    } else {
      setNotesAsMap((prev) =>
        prev.map((obj, index) =>
          index === arrayIndex ? { ...obj, [key]: value } : obj
        )
      );
    }
  };

  const sortSelectEntries =
    tabValueMap[currentTabValue] === "notes"
      ? [
          { type: "group_label", label: "Sorting" },
          {
            type: "value",
            label: "New Modified ↓",
            value: "date_modified_dec",
          },
          {
            type: "value",
            label: "Old Modified ↑",
            value: "date_modified_inc",
          },
          {
            type: "value",
            label: "New Created ↓",
            value: "date_created_dec",
          },
          {
            type: "value",
            label: "Old Created ↑",
            value: "date_created_inc",
          },
        ]
      : [
          {
            type: "value",
            label: "Alphabetical ↑",
            value: "alphabetical_inc",
          },
          {
            type: "value",
            label: "Alphabetical ↓",
            value: "alphabetical_dec",
          },
          {
            type: "value",
            label: "New Modified ↓",
            value: "date_modified_dec",
          },
          {
            type: "value",
            label: "Old Modified ↑",
            value: "date_modified_inc",
          },
          {
            type: "value",
            label: "New Created ↓",
            value: "date_created_dec",
          },
          {
            type: "value",
            label: "Old Created ↑",
            value: "date_created_inc",
          },
        ];

  const clearSaveCountDown = () => {
    clearTimeout(saveTimeOutId.current);
    setSaveCountDown(0);
    saveCountDownRef.current = 0;
    saveTimeOutId.current = null;
  };

  const handleSave = () => {
    if (updatedNotes.current.size > 0) {
      for (const note of updatedNotes.current) {
        if (note.delete) {
          deleteEpubData(note);
        } else {
          putEpubData(note);
        }
      }
    }
    if (updatedMemos.current.size > 0) {
      for (const memo of updatedMemos.current) {
        if (memo.memo?.trim().length === 0) {
          delete memos[memo.selectedText];
          deleteEpubData(memo);
        } else {
          putEpubData(memo);
        }
      }
    }
    updatedNotes.current.clear();
    updatedMemos.current.clear();
    clearSaveCountDown();
  };

  const handleSaveCountDown = () => {
    if (saveCountDownRef.current <= 1) {
      handleSave();
      clearSaveCountDown();
    } else {
      setSaveCountDown((prev) => prev - 1);
      saveCountDownRef.current -= 1;
      saveTimeOutId.current = setTimeout(handleSaveCountDown, 1000);
    }
  };

  const startSaveCountDown = () => {
    clearTimeout(saveTimeOutId.current);
    saveCountDownRef.current = 5;
    setSaveCountDown(5);
    saveTimeOutId.current = setTimeout(handleSaveCountDown, 1000);
  };

  const handleColorPickerOnChange = (isTextField) => (event) => {
    if (
      dataForColorPicker.highlightColor === event.target.value &&
      isTextField !== true
    ) {
      return;
    }
    setDataForColorPicker((prev) => ({
      ...prev,
      highlightColor:
        isTextField && event.target.value === "" ? null : event.target.value,
    }));
  };

  const handleColorPickerRadioOnClick = (value) => {
    if (dataForColorPicker.highlightColor === value) {
      setDataForColorPicker((prev) => ({
        ...prev,
        highlightColor: null,
      }));
    }
  };

  const handleOpenColorPicker = (note, noteId, arrayIndex) => (event) => {
    setDataForColorPicker({ ...note, noteId, arrayIndex });
    setColorPickAnchorEl(event.currentTarget);
  };

  const deleteNote = (note, noteId, arrayIndex) => {
    const chapter = spine[note.spineIndex].label;
    deleteNotesHelper(chapter, arrayIndex);
    notes[note.spineIndex][noteId].delete = true;
    updatedNotes.current.add(notes[note.spineIndex][noteId]);
    delete notes[note.spineIndex][noteId];
  };

  const updateNoteMarksOrDeleteInDOM = (
    note,
    noteId,
    deleteMark,
    arrayIndex
  ) => {
    const nodes = document.getElementsByClassName(noteId);
    if (deleteMark) {
      deleteNote(note, noteId, arrayIndex);
      disableHighlightNodes(nodes);
    } else {
      for (const node of nodes) {
        node.style.backgroundColor = note.highlightColor;
      }
    }
    startSaveCountDown();
  };

  const handleCloseColorPicker = () => {
    const note =
      notes[dataForColorPicker.spineIndex][dataForColorPicker.noteId];
    if (note.highlightColor !== dataForColorPicker.highlightColor) {
      const chapter = spine[dataForColorPicker.spineIndex].label;
      setNoteValueHelper(
        chapter,
        dataForColorPicker.arrayIndex,
        "highlightColor",
        dataForColorPicker.highlightColor
      );
      note.highlightColor = dataForColorPicker.highlightColor;
      note.dateModified = new Date().toJSON();

      updateNoteMarksOrDeleteInDOM(
        dataForColorPicker,
        dataForColorPicker.noteId,
        false
      );
      updatedNotes.current.add(note);
    }
    setDataForColorPicker(null);
    setColorPickAnchorEl(null);
  };

  const handleGoToHighlight = (spineIndex, noteId) => {
    handleCloseAnnotation();
    goToNote(spineIndex, noteId);
  };

  const updateNotesAsMap = (noteSort) => {
    if (noteSortWithChaptersRef.current) {
      const res = {};
      let prevSubheader = null;
      for (const chapterNodes of Object.values(notes)) {
        for (const [noteId, note] of Object.entries(chapterNodes)) {
          if (note.deleted) {
            continue;
          }
          const currentLabel = spine[note.spineIndex].label;
          if (prevSubheader !== spine[note.spineIndex].label) {
            res[currentLabel] = [];
          }
          prevSubheader = currentLabel;
          note.id = noteId;
          res[currentLabel].push(note);
        }
      }
      if (noteSort.includes("date_modified")) {
        Object.values(res).forEach((list) =>
          list.sort((a, b) =>
            noteSort.includes("dec")
              ? Date.parse(b.dateModified) - Date.parse(a.dateModified)
              : Date.parse(a.dateModified) - Date.parse(b.dateModified)
          )
        );
      } else if (noteSort.includes("date_created")) {
        Object.values(res).forEach((list) =>
          list.sort((a, b) =>
            noteSort.includes("dec")
              ? Date.parse(b.dateCreated) - Date.parse(a.dateCreated)
              : Date.parse(a.dateCreated) - Date.parse(b.dateCreated)
          )
        );
      }
      return res;
    } else if (!noteSortWithChaptersRef.current) {
      const res = [];
      let prevSubheader = null;
      for (const chapterNodes of Object.values(notes)) {
        for (const [noteId, note] of Object.entries(chapterNodes)) {
          if (note.deleted) {
            continue;
          }
          const currentLabel = spine[note.spineIndex].label;
          if (prevSubheader !== spine[note.spineIndex].label) {
            res[currentLabel] = [];
          }
          prevSubheader = currentLabel;
          note.id = noteId;
          note.chapterLabel = currentLabel;
          res.push(note);
        }
      }
      if (noteSort.includes("date_modified")) {
        res.sort((a, b) =>
          noteSort.includes("dec")
            ? Date.parse(b.dateModified) - Date.parse(a.dateModified)
            : Date.parse(a.dateModified) - Date.parse(b.dateModified)
        );
      } else if (noteSort.includes("date_created")) {
        res.sort((a, b) =>
          noteSort.includes("dec")
            ? Date.parse(b.dateCreated) - Date.parse(a.dateCreated)
            : Date.parse(a.dateCreated) - Date.parse(b.dateCreated)
        );
      }
      return res;
    }
  };

  const updateMemosAsArray = () => {
    if (memoSort.includes("alphabetical")) {
      return Object.entries(memos).sort((a, b) =>
        memoSort.includes("inc")
          ? a[0].localeCompare(b[0])
          : b[0].localeCompare(a[0])
      );
    } else if (memoSort.includes("date_modified")) {
      return Object.entries(memos).sort((a, b) =>
        memoSort.includes("dec")
          ? Date.parse(b[1].dateModified) - Date.parse(a[1].dateModified)
          : Date.parse(a[1].dateModified) - Date.parse(b[1].dateModified)
      );
    } else if (memoSort.includes("date_created")) {
      return Object.entries(memos).sort((a, b) =>
        memoSort.includes("dec")
          ? Date.parse(b[1].dateCreated) - Date.parse(a[1].dateCreated)
          : Date.parse(a[1].dateCreated) - Date.parse(b[1].dateCreated)
      );
    }
  };

  const scrollToCurrentChapterSubheader = () => {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationList, observer) => {
      if (
        mutationList.some((mutation) =>
          mutation.target.classList?.contains("note-delete-button")
        )
      ) {
        currentChapterSubheaderRef.current?.scrollIntoView();
        currentChapterSubheaderRef.current = null;
        scrollIntoViewObserver.current = null;
        observer.disconnect();
      }
    });
    scrollIntoViewObserver.current = observer;
    observer.observe(document.body, config);
  };

  const setNotes = (noteSort) => setNotesAsMap(updateNotesAsMap(noteSort));

  const handleOpenAnnotation = (event) => {
    updatedNotes.current.clear();
    updatedMemos.current.clear();
    scrollToCurrentChapterSubheader();
    setNotes(noteSort);
    setMemoAsArray(updateMemosAsArray());
    clearTemporaryMarks();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAnnotation = () => {
    handleSave();
    clearSaveCountDown();
    if (scrollIntoViewObserver.current !== null) {
      scrollIntoViewObserver.current.disconnect();
    }
    setAnchorEl(null);
  };

  const handleOnChangeTab = (event, value) => {
    if (tabValueMap[value] === "notes") {
      scrollToCurrentChapterSubheader();
    }
    setCurrentTabValue(value);
  };

  const handleNoteTextAreaOnChange = (note, noteId, arrayIndex) => (event) => {
    const chapter = spine[note.spineIndex].label;
    setNoteValueHelper(chapter, arrayIndex, "note", event.target.value);
    notes[note.spineIndex][noteId].note = event.target.value;
    notes[note.spineIndex][noteId].dateModified = new Date().toJSON();
    updatedNotes.current.add(notes[note.spineIndex][noteId]);
    startSaveCountDown();
  };

  const handleMemoTextAreaOnChange = (key, memoArrayIndex) => (event) => {
    memos[key].memo = event.target.value;
    memos[key].dateModified = new Date().toJSON();
    setMemoAsArray((prev) =>
      prev.map(([key, entry], index) => {
        if (index === memoArrayIndex) {
          entry.memo = event.target.value;
        }
        return [key, entry];
      })
    );
    updatedMemos.current.add(memos[key]);
    startSaveCountDown();
  };

  const handleSortChange = (event) => {
    if (event?.target?.value === null) {
      return;
    }
    const value =
      event?.target?.value ??
      (tabValueMap[currentTabValue] === "notes" ? noteSort : memoSort);
    if (tabValueMap[currentTabValue] === "notes") {
      setNoteSort(value);
      setNotes(value);
    } else if (tabValueMap[currentTabValue] === "memos") {
      setMemoSort(value);
      if (value.includes("alphabetical")) {
        setMemoAsArray((prev) => {
          const newArray = structuredClone(prev);
          newArray.sort((a, b) =>
            value.includes("inc")
              ? a[0].localeCompare(b[0])
              : b[0].localeCompare(a[0])
          );
          return newArray;
        });
      } else if (value.includes("date_modified")) {
        setMemoAsArray((prev) => {
          const newArray = structuredClone(prev);
          newArray.sort((a, b) =>
            value.includes("dec")
              ? Date.parse(b[1].dateModified) - Date.parse(a[1].dateModified)
              : Date.parse(a[1].dateModified) - Date.parse(b[1].dateModified)
          );
          return newArray;
        });
      } else if (value.includes("date_created")) {
        setMemoAsArray((prev) => {
          const newArray = structuredClone(prev);
          newArray.sort((a, b) =>
            value.includes("dec")
              ? Date.parse(b[1].dateCreated) - Date.parse(a[1].dateCreated)
              : Date.parse(a[1].dateCreated) - Date.parse(b[1].dateCreated)
          );
          return newArray;
        });
      }
    }
  };

  const notesWithGroups = () =>
    Object.entries(Array.isArray(notesAsMap) ? {} : notesAsMap).map(
      ([chapterName, chapterNotes]) => (
        <Accordion
          key={chapterName}
          ref={
            chapterName === spine[currentSpineIndex].label
              ? currentChapterSubheaderRef
              : null
          }
          defaultExpanded={chapterName === spine[currentSpineIndex].label}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              sx={{
                fontWeight:
                  chapterName === spine[currentSpineIndex].label
                    ? "bold"
                    : "unset",
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
                    <LastModified entry={note} />
                    <Typography>
                      <span
                        style={{
                          backgroundColor: note.highlightColor,
                        }}
                      >
                        {note.selectedText}
                      </span>
                    </Typography>
                    <Stack sx={{ width: "100%" }}>
                      <Typography variant="body">Note</Typography>
                      <Textarea
                        value={note.note}
                        onChange={handleNoteTextAreaOnChange(
                          note,
                          note.id,
                          arrayIndex
                        )}
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
                      <Tooltip title="Go to location">
                        <IconButton
                          onClick={() =>
                            handleGoToHighlight(note.spineIndex, note.id)
                          }
                          size="small"
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Color">
                        <IconButton
                          onClick={handleOpenColorPicker(
                            note,
                            note.id,
                            arrayIndex
                          )}
                          size="small"
                        >
                          <PaletteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() =>
                            updateNoteMarksOrDeleteInDOM(
                              note,
                              note.id,
                              true,
                              arrayIndex
                            )
                          }
                          size="small"
                          className={"note-delete-button"}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )
    );

  const notesWithoutGroups = () => (
    <Stack spacing={2} sx={{ padding: 2 }}>
      {(Array.isArray(notesAsMap) ? notesAsMap : []).map((note, arrayIndex) => (
        <Paper key={note.id} elevation={24} sx={{ padding: 1 }}>
          <Stack spacing={1}>
            <LastModified entry={note} />
            <Typography variant="h6">{note.chapterLabel}</Typography>
            <Typography>
              <span
                style={{
                  backgroundColor: note.highlightColor,
                }}
              >
                {note.selectedText}
              </span>
            </Typography>
            <Stack sx={{ width: "100%" }}>
              <Typography variant="body">Note</Typography>
              <Textarea
                value={note.note}
                onChange={handleNoteTextAreaOnChange(note, note.id, arrayIndex)}
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
                  onClick={handleOpenColorPicker(note, note.id, arrayIndex)}
                  size="small"
                >
                  <PaletteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  onClick={() =>
                    updateNoteMarksOrDeleteInDOM(
                      note,
                      note.id,
                      true,
                      arrayIndex
                    )
                  }
                  size="small"
                  className={"note-delete-button"}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );

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
        <Menu
          anchorEl={colorPickAnchorEl}
          open={openColorPicker}
          onClose={handleCloseColorPicker}
        >
          {dataForColorPicker ? (
            <Box sx={{ padding: 1 }}>
              <SimpleColorPicker
                color={dataForColorPicker.highlightColor}
                handleRadioOnClick={handleColorPickerRadioOnClick}
                handleRadioChange={handleColorPickerOnChange(false)}
                handleTextFieldChange={handleColorPickerOnChange(true)}
              />
            </Box>
          ) : null}
        </Menu>
        <Stack
          sx={{
            width: greaterThanSmall
              ? `${Math.floor(window.innerWidth / 2)}px`
              : window.innerWidth - 32, // 16 is the menu margin gap from the window on each side
          }}
        >
          <AppBar
            position="sticky"
            sx={{
              marginTop: -1,
              paddingLeft: 1,
              paddingRight: 1,
            }}
          >
            <Stack
              spacing={1}
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{ height: appBarHeight }}
            >
              <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <SmallTabs
                  variant="fullWidth"
                  value={currentTabValue}
                  onChange={handleOnChangeTab}
                  tabpanelheight={tabPanelHeight}
                >
                  <HtmlTooltip
                    title={
                      <Stack spacing={1}>
                        <Typography variant="h6">{"Notes"}</Typography>
                        <Typography variant="subtitle2">
                          {"Can be left empty."}
                        </Typography>
                        <Divider />
                        <Typography>{"Highlight"}</Typography>
                        <Typography variant="subtitle2">
                          {
                            "If no highlight color is selected, the highlight will be transparent."
                          }
                        </Typography>
                      </Stack>
                    }
                    placement="bottom"
                    enterDelay={300}
                    enterNextDelay={300}
                  >
                    <SmallTab
                      icon={<NotesIcon />}
                      iconPosition="end"
                      label="Notes"
                      tabpanelheight={tabPanelHeight}
                    />
                  </HtmlTooltip>
                  <HtmlTooltip
                    title={
                      <Stack spacing={1}>
                        <Typography variant="h6">{"Memos"}</Typography>
                        <Typography variant="subtitle2">
                          {"Memos appear in every occurrence of a word/phrase"}
                        </Typography>
                        <Divider />
                        <Typography>{"Usage"}</Typography>
                        <Typography variant="subtitle2">
                          {
                            "Jot down something to remind yourself of a character, place, or thing. Whenever you highlight this again, this memo will appear."
                          }
                        </Typography>
                      </Stack>
                    }
                    enterDelay={300}
                    enterNextDelay={300}
                    placement="bottom"
                  >
                    <SmallTab
                      icon={<StickyNote2Icon />}
                      iconPosition="end"
                      label="Memos"
                      tabpanelheight={tabPanelHeight}
                    />
                  </HtmlTooltip>
                </SmallTabs>
              </Paper>
              <Tooltip title={"Save & Close"}>
                <IconButton onClick={handleCloseAnnotation} size="small">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack
              justifyContent={"space-between"}
              alignItems={"center"}
              direction="row"
              sx={{ marginBottom: 0.5 }}
            >
              <Stack alignItems={"center"} direction={"row"} spacing={1}>
                <Typography>Sort:</Typography>
                <Select
                  onChange={handleSortChange}
                  value={
                    tabValueMap[currentTabValue] === "notes"
                      ? noteSort
                      : memoSort
                  }
                  sx={{ height: 30 }}
                  size="small"
                >
                  <MenuItem
                    sx={{
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                    disableRipple
                    value={null}
                  >
                    <FormControlLabel
                      control={<Switch />}
                      checked={noteSortWithChapters}
                      onChange={(event) => {
                        setNoteSortWithChapters(event.target.checked);
                        noteSortWithChaptersRef.current = event.target.checked;
                        handleSortChange(null);
                      }}
                      label="Group by Chapters"
                      labelPlacement="start"
                    />
                  </MenuItem>
                  {sortSelectEntries.map((entry) =>
                    entry.type === "group_label" ? (
                      <ListSubheader key={entry.label}>
                        {entry.label}
                      </ListSubheader>
                    ) : (
                      <MenuItem key={entry.value} value={entry.value}>
                        {entry.label}
                      </MenuItem>
                    )
                  )}
                </Select>
              </Stack>
              <Typography color="GrayText" variant="subtitle2">
                {saveCountDown > 0 ? `Saving in ${saveCountDown}` : "Saved"}
              </Typography>
            </Stack>
          </AppBar>
          {tabValueMap[currentTabValue] === "notes" ? (
            <Stack>
              {Object.keys(notesAsMap).length === 0 ? (
                <Typography
                  sx={{
                    padding: 1,
                    marginTop: 1,
                    alignSelf: "center",
                  }}
                  variant="h5"
                >
                  {"No Notes"}
                </Typography>
              ) : noteSortWithChapters ? (
                notesWithGroups()
              ) : (
                notesWithoutGroups()
              )}
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ padding: 1, width: "100%" }}>
              {memosAsArray.length === 0 ? (
                <Typography
                  sx={{ paddingTop: 1, alignSelf: "center" }}
                  variant="h5"
                >
                  {"No Memos"}
                </Typography>
              ) : (
                memosAsArray.map(([key, entry], memoArrayIndex) => (
                  <Stack
                    component={Paper}
                    spacing={1}
                    sx={{ padding: 1 }}
                    key={key}
                  >
                    <Typography variant="h6">
                      {key[0].toUpperCase() + key.substring(1)}
                    </Typography>
                    <LastModified entry={entry} />
                    <Textarea
                      value={entry.memo}
                      onChange={handleMemoTextAreaOnChange(key, memoArrayIndex)}
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
                        width: "100%",
                      }}
                      minRows={1}
                    />
                  </Stack>
                ))
              )}
            </Stack>
          )}
        </Stack>
      </Menu>
    </>
  );
};

AnnotationViewer.propTypes = {
  spine: PropTypes.array.isRequired,
  entryId: PropTypes.string.isRequired,
  clearTemporaryMarks: PropTypes.func.isRequired,
  memos: PropTypes.object.isRequired,
  notes: PropTypes.object.isRequired,
  currentSpineIndex: PropTypes.number.isRequired,
  goToNote: PropTypes.func.isRequired,
};

LastModified.propTypes = {
  entry: PropTypes.object.isRequired,
};
