import * as React from "react";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Divider,
  IconButton,
  Menu,
  Paper,
  Stack,
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
import { updatePreference } from "../../../api/IndexedDB/userPreferences";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import PaletteIcon from "@mui/icons-material/Palette";
import { SimpleColorPicker } from "./SimpleColorPicker";
import { deleteClassOfNodesAndLiftChildren } from "../domUtils";

export const AnnotationViewer = ({
  spine,
  entryId,
  clearSearchMarkNode,
  notes,
  memos,
  currentSpineIndex,
  goToNote,
  spineOverride,
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
  const updatedNotes = React.useRef(false);
  const updatedMemos = React.useRef(false);
  const updatedSpineOverride = React.useRef(false);
  const clearedMemos = React.useRef([]);
  const currentChapterSubheaderRef = React.useRef(null);
  const scrollIntoViewObserver = React.useRef(null);
  const [colorPickAnchorEl, setColorPickAnchorEl] = React.useState(null);
  const openColorPicker = Boolean(colorPickAnchorEl);
  const [dataForColorPicker, setDataForColorPicker] = React.useState(null);
  const saveTimeOutId = React.useRef(null);
  const saveCountDownRef = React.useRef(0);
  const [saveCountDown, setSaveCountDown] = React.useState(0);

  const clearSaveCountDown = () => {
    clearTimeout(saveTimeOutId.current);
    setSaveCountDown(0);
    saveCountDownRef.current = 0;
    saveTimeOutId.current = null;
  };

  const handleSave = () => {
    const updatedData = { key: entryId };
    if (updatedSpineOverride.current) {
      updatedData.spineOverride = spineOverride;
    }
    if (updatedNotes.current) {
      updatedData.notes = notes;
    }
    if (updatedMemos.current) {
      for (const keyOfClearedMemo of clearedMemos.current) {
        if (memos[keyOfClearedMemo]?.trim().length === 0) {
          delete memos[keyOfClearedMemo];
        }
      }
      updatedData.memos = memos;
    }
    if (
      updatedSpineOverride.current ||
      updatedNotes.current ||
      updatedMemos.current
    ) {
      updatePreference(updatedData);
    }
    updatedNotes.current = false;
    updatedMemos.current = false;
    updatedSpineOverride.current = false;
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

  const handleOpenColorPicker = (note, chapter, arrayIndex) => (event) => {
    setDataForColorPicker({ ...note, chapter, arrayIndex });
    setColorPickAnchorEl(event.currentTarget);
  };

  const updateNoteMarksOrDelete = (note, deleteMark) => {
    const page = document.createElement("div");
    page.innerHTML = spineOverride[note.spineIndex].element;
    let nodes = page.getElementsByClassName(note.id);
    if (deleteMark) {
      deleteClassOfNodesAndLiftChildren(nodes);
    } else {
      for (const node of nodes) {
        node.style.backgroundColor = note.highlightColor;
      }
    }
    spineOverride[note.spineIndex].element = page.innerHTML;
    updatedSpineOverride.current = true;
    startSaveCountDown();
    if (currentSpineIndex !== note.spineIndex) {
      return;
    }
    nodes = document.getElementsByClassName(note.id);
    if (deleteMark) {
      deleteClassOfNodesAndLiftChildren(nodes);
    } else {
      for (const node of nodes) {
        node.style.backgroundColor = note.highlightColor;
      }
    }
  };

  const handleCloseColorPicker = () => {
    if (
      notes[dataForColorPicker.id].highlightColor !==
      dataForColorPicker.highlightColor
    ) {
      setNotesAsMap((prev) => ({
        ...prev,
        [dataForColorPicker.chapter]: prev[dataForColorPicker.chapter].map(
          (obj, index) =>
            index === dataForColorPicker.arrayIndex
              ? { ...obj, highlightColor: dataForColorPicker.highlightColor }
              : obj
        ),
      }));
      notes[dataForColorPicker.id].highlightColor =
        dataForColorPicker.highlightColor;

      updateNoteMarksOrDelete(dataForColorPicker, false);
      updatedNotes.current = true;
    }
    setDataForColorPicker(null);
    setColorPickAnchorEl(null);
  };

  const handleGoToHighlight = (noteId) => {
    handleCloseAnnotation();
    goToNote(noteId);
  };

  const updateNotesAsMap = () => {
    const res = {};
    const notesAsEntriesSorted = Object.entries(notes).sort(
      (a, b) => a[1].spineIndex - b[1].spineIndex
    );
    let prevSubheader = null;
    for (const [noteId, note] of notesAsEntriesSorted) {
      const currentLabel = spine[note.spineIndex].label;
      if (prevSubheader !== spine[note.spineIndex].label) {
        res[currentLabel] = [];
      }
      note.id = noteId;
      res[currentLabel].push(note);
      prevSubheader = currentLabel;
    }
    return res;
  };

  const updateMemosAsArray = () => {
    return Object.entries(memos);
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

  const handleOpenAnnotation = (event) => {
    updatedNotes.current = false;
    updatedMemos.current = false;
    updatedSpineOverride.current = false;
    clearedMemos.current = [];
    scrollToCurrentChapterSubheader();
    setNotesAsMap(updateNotesAsMap());
    setMemoAsArray(updateMemosAsArray());
    clearSearchMarkNode();
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

  const handleNoteTextAreaOnChange =
    (noteId, chapter, arrayIndex) => (event) => {
      setNotesAsMap((prev) => ({
        ...prev,
        [chapter]: prev[chapter].map((obj, index) =>
          index === arrayIndex ? { ...obj, note: event.target.value } : obj
        ),
      }));
      notes[noteId].note = event.target.value;
      updatedNotes.current = true;
      startSaveCountDown();
    };

  const handleMemoTextAreaOnChange = (key, memoArrayIndex) => (event) => {
    memos[key] = event.target.value;
    setMemoAsArray((prev) =>
      prev.map((entry, index) =>
        index === memoArrayIndex ? [key, event.target.value] : entry
      )
    );
    if (event.target.value.trim().length === 0) {
      clearedMemos.current.push(key);
    }
    updatedMemos.current = true;
    startSaveCountDown();
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
              paddingLeft: 2,
              paddingRight: 3,
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
              <IconButton onClick={handleCloseAnnotation} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography
              color="GrayText"
              variant="subtitle2"
              sx={{ marginTop: -1, alignSelf: "end" }}
            >
              {saveCountDown > 0 ? `Saving in ${saveCountDown}` : "Saved"}
            </Typography>
          </AppBar>
          {tabValueMap[currentTabValue] === "notes" ? (
            <Stack>
              {Object.keys(notesAsMap).length === 0 ? (
                <Typography
                  sx={{ padding: 1, alignSelf: "center" }}
                  variant="h5"
                >
                  {"No Notes"}
                </Typography>
              ) : (
                Object.keys(notesAsMap).map((chapter) => (
                  <Accordion
                    key={chapter}
                    ref={
                      chapter === spine[currentSpineIndex].label
                        ? currentChapterSubheaderRef
                        : null
                    }
                    defaultExpanded={chapter === spine[currentSpineIndex].label}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        sx={{
                          fontWeight:
                            chapter === spine[currentSpineIndex].label
                              ? "bold"
                              : "unset",
                        }}
                        component="span"
                      >
                        {chapter}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {notesAsMap[chapter].map((note, index) => (
                          <Paper
                            key={note.id}
                            elevation={24}
                            sx={{ padding: 1 }}
                          >
                            <Stack spacing={1}>
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
                                <Typography variant="h6">Note</Typography>
                                <Textarea
                                  value={note.note}
                                  onChange={handleNoteTextAreaOnChange(
                                    note.id,
                                    chapter,
                                    index
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
                                    onClick={() => handleGoToHighlight(note.id)}
                                    size="small"
                                  >
                                    <LinkIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Change Color">
                                  <IconButton
                                    onClick={handleOpenColorPicker(
                                      note,
                                      chapter,
                                      index
                                    )}
                                    size="small"
                                  >
                                    <PaletteIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    onClick={() => {}}
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
                ))
              )}
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ padding: 1, width: "100%" }}>
              {memosAsArray.length === 0 ? (
                <Typography sx={{ alignSelf: "center" }} variant="h5">
                  {"No Memos"}
                </Typography>
              ) : (
                memosAsArray.map(([key, value], memoArrayIndex) => (
                  <Stack
                    component={Paper}
                    spacing={1}
                    sx={{ padding: 1 }}
                    key={key}
                  >
                    <Typography variant="h6">
                      {key[0].toUpperCase() + key.substring(1)}
                    </Typography>
                    <Textarea
                      value={value}
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
  clearSearchMarkNode: PropTypes.func.isRequired,
  memos: PropTypes.object.isRequired,
  notes: PropTypes.object.isRequired,
  currentSpineIndex: PropTypes.number.isRequired,
  goToNote: PropTypes.func.isRequired,
  spineOverride: PropTypes.object.isRequired,
};
