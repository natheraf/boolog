import * as React from "react";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListSubheader,
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

export const AnnotationViewer = ({
  spine,
  entryId,
  clearSearchMarkNode,
  notes,
  memos,
  currentSpineIndex,
}) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const tabPanelHeight = "100%";
  const appBarHeight = 58;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openAnnotation = Boolean(anchorEl);
  const [currentTabValue, setCurrentTabValue] = React.useState(0);
  const tabValueMap = ["notes", "memos"];
  const [notesAsListArray, setNotesAsListArray] = React.useState([]);
  const [memosAsArray, setMemoAsArray] = React.useState([]);
  const updatedNotes = React.useRef(false);
  const updatedMemos = React.useRef(false);
  const clearedMemos = React.useRef([]);
  const currentChapterSubheaderRef = React.useRef(null);
  const scrollIntoViewObserver = React.useRef(null);

  const updateNotesAsListArray = () => {
    const res = [];
    const notesAsEntriesSorted = Object.entries(notes).sort(
      (a, b) => a[1].spineIndex - b[1].spineIndex
    );
    let prevSubheader = null;
    for (const [noteId, note] of notesAsEntriesSorted) {
      if (prevSubheader !== spine[note.spineIndex].label) {
        res.push({
          type: "listSubheader",
          label: spine[note.spineIndex].label,
          ref:
            currentSpineIndex === note.spineIndex
              ? currentChapterSubheaderRef
              : null,
        });
      }
      res.push({ type: "listItem", noteId, ...note });
      prevSubheader = spine[note.spineIndex].label;
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
        currentChapterSubheaderRef.current.scrollIntoView();
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
    clearedMemos.current = [];
    scrollToCurrentChapterSubheader();
    setNotesAsListArray(updateNotesAsListArray());
    setMemoAsArray(updateMemosAsArray());
    clearSearchMarkNode();
    setAnchorEl(event.currentTarget);
  };
  const handleCloseAnnotation = () => {
    const updatedData = { key: entryId };
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
    if (updatedNotes.current || updatedMemos.current) {
      updatePreference(updatedData);
    }
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

  const handleNoteTextAreaOnChange = (noteId, listArrayIndex) => (event) => {
    setNotesAsListArray((prev) =>
      prev.map((obj, index) =>
        index === listArrayIndex ? { ...obj, note: event.target.value } : obj
      )
    );
    notes[noteId].note = event.target.value;
    updatedNotes.current = true;
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
          </AppBar>
          {tabValueMap[currentTabValue] === "notes" ? (
            <List
              sx={{
                "& ul": { padding: 0 },
              }}
              subheader={<li />}
              dense
              disablePadding
            >
              <Stack spacing={2}>
                {notesAsListArray.map((obj, listArrayIndex) =>
                  obj.type === "listSubheader" ? (
                    <ListSubheader
                      key={obj.label}
                      ref={obj.ref}
                      sx={{
                        position: "sticky",
                        top: appBarHeight,
                      }}
                    >
                      {obj.label}
                    </ListSubheader>
                  ) : (
                    <Box key={obj.noteId} sx={{ padding: 1 }}>
                      <Paper elevation={24} sx={{ padding: 1 }}>
                        <ListItem
                          component={Stack}
                          alignItems="flex-start"
                          spacing={1}
                          disableGutters
                        >
                          <Typography>
                            <span
                              style={{
                                backgroundColor: obj.highlightColor,
                              }}
                            >
                              {obj.selectedText}
                            </span>
                          </Typography>
                          <Stack sx={{ width: "100%" }}>
                            <Typography variant="h6">Note</Typography>
                            <Textarea
                              value={obj.note}
                              onChange={handleNoteTextAreaOnChange(
                                obj.noteId,
                                listArrayIndex
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
                          <Stack direction="row">
                            <IconButton
                              onClick={handleCloseAnnotation}
                              size="small"
                              className={"note-delete-button"}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Stack>
                        </ListItem>
                      </Paper>
                    </Box>
                  )
                )}
              </Stack>
            </List>
          ) : (
            <Stack spacing={1} sx={{ padding: 1, width: "100%" }}>
              {memosAsArray.length === 0 ? (
                <Typography variant="h5">{"No Memos"}</Typography>
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
};
