import * as React from "react";
import {
  Backdrop,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Menu,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import NotesIcon from "@mui/icons-material/Notes";
import { Textarea } from "../../../components/Textarea";
import { updateEpubData } from "../../../api/IndexedDB/epubData";
import PropTypes from "prop-types";
import { getNewId } from "../../../api/IndexedDB/common";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { HtmlTooltip, SmallTab, SmallTabs } from "../../CustomComponents";
import { SimpleColorPicker } from "./SimpleColorPicker";
import { disableHighlightNodes, handleInjectingMark } from "../domUtils";
import { addListener } from "../../listenerManager";

let selectedRange = null;
let selectedRangeIndexed = null;

const formatMemoKey = (key) => {
  if (!key) {
    return null;
  }
  key = key.toLowerCase();
  const apostrophes = ["’", "'", "ʼ"];
  for (const char of apostrophes) {
    if (
      (key.lastIndexOf("s") === key.length - 2 &&
        key.lastIndexOf(char) === key.length - 1) ||
      (key.lastIndexOf("s") === key.length - 1 &&
        key.lastIndexOf(char) === key.length - 2)
    ) {
      key = key.substring(0, key.lastIndexOf(char));
    }
  }
  return key;
};

export const Annotator = ({
  entryId,
  memos,
  notes,
  clearSearchMarkNode,
  spineIndex,
  anchorEl,
  setAnchorEl,
}) => {
  const annotatorHeight = 200;
  const annotatorWidth = 300;
  const tabPanelHeight = 30;
  const [selectionParentRect, setSelectionParentRect] = React.useState(null);
  const [selectionRect, setSelectionRect] = React.useState(null);
  const [selectedText, setSelectedText] = React.useState(
    notes[spineIndex]?.[anchorEl?.getAttribute("noteid")]?.selectedText ?? null
  );
  const memoKeyOfHighlight = formatMemoKey(
    notes[spineIndex]?.[anchorEl?.getAttribute("noteid")]?.selectedText
  );
  const textToMemoKeyFormat = React.useRef(memoKeyOfHighlight);
  const [selectedAnchor, setSelectedAnchor] = React.useState(null);
  const openAnnotator = Boolean(anchorEl || selectedAnchor);
  const annotatorOpen = React.useRef(false);

  const tabValueMap = ["note", "memo"];
  const [currentTabValue, setCurrentTabValue] = React.useState(
    notes[spineIndex]?.[anchorEl?.getAttribute("noteid")]
      ? tabValueMap.indexOf("note")
      : tabValueMap.indexOf("memo")
  );

  const [memo, setMemo] = React.useState(
    memoKeyOfHighlight ? memos[memoKeyOfHighlight] ?? "" : ""
  );
  const [note, setNote] = React.useState(
    notes[spineIndex]?.[anchorEl?.getAttribute("noteid")]?.note ?? ""
  );
  const [highlightColor, setHighlightColor] = React.useState(
    notes[spineIndex]?.[anchorEl?.getAttribute("noteid")]?.highlightColor ??
      null
  );
  const oldTouchSelect = React.useRef(null);

  const handleClear = (type) => {
    if (type === "memo") {
      setMemo("");
    } else if (type === "note") {
      setNote("");
      setHighlightColor(null);
    }
  };

  const handleHighlightColorChange = (isTextField) => (event) => {
    if (highlightColor === event.target.value && isTextField !== true) {
      return;
    }
    setHighlightColor(
      isTextField && event.target.value === "" ? null : event.target.value
    );
  };

  const handleHighlightColorClick = (value) => {
    if (highlightColor === value) {
      setHighlightColor(null);
    }
  };

  const handleOnChangeTab = (event, value) => {
    setCurrentTabValue(value);
  };

  const handleGetTextSelection = () => {
    const selectedString = window.getSelection()?.toString()?.trim();
    if (annotatorOpen.current === false && selectedString?.length > 0) {
      clearSearchMarkNode();
      const selection = window.getSelection();
      if (
        !selection.anchorNode.parentElement.getAttribute("nodeid") ||
        !selection.focusNode.parentElement.getAttribute("nodeid")
      ) {
        return;
      }
      setSelectionParentRect(
        selection.anchorNode.parentElement.getBoundingClientRect()
      );
      setSelectionRect(selection.getRangeAt(0).getBoundingClientRect());
      setSelectedText(selectedString);
      setSelectedAnchor(selection.anchorNode.parentElement);
      annotatorOpen.current = true;
      // removes possessive form
      textToMemoKeyFormat.current = formatMemoKey(selectedString);
      setMemo(memos[textToMemoKeyFormat.current] ?? "");
      // if 2 spaces, probably a note
      setCurrentTabValue(
        selectedString.indexOf(" ") > -1 &&
          selectedString.indexOf(" ") !== selectedString.lastIndexOf(" ")
          ? tabValueMap.indexOf("note")
          : tabValueMap.indexOf("memo")
      );
      setHighlightColor(null);
      setNote("");

      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        range.setEnd(selection.anchorNode, selection.anchorOffset);
        range.setStart(selection.focusNode, selection.focusOffset);
      }

      let startOffset = range.startOffset;
      while (range.startContainer.textContent[startOffset] === " ") {
        startOffset += 1;
      }
      let endOffset = range.endOffset;
      while (range.endContainer.textContent[endOffset - 1] === " ") {
        endOffset -= 1;
      }

      range.setStart(range.startContainer, startOffset);
      range.setEnd(range.endContainer, endOffset);

      const startContainerParent = range.startContainer.parentElement;
      const endContainerParent = range.endContainer.parentElement;
      let parentStartIndex = 0;
      for (const child of startContainerParent.childNodes) {
        if (child.contains(range.startContainer)) {
          break;
        }
        parentStartIndex += 1;
      }
      let parentEndIndex = 0;
      for (const child of endContainerParent.childNodes) {
        if (child.contains(range.endContainer)) {
          break;
        }
        parentEndIndex += 1;
      }
      selectedRangeIndexed = {
        startParentContainerId: startContainerParent.getAttribute("nodeid"),
        parentStartIndex,
        startOffset,
        endParentContainerId: endContainerParent.getAttribute("nodeid"),
        parentEndIndex,
        endOffset,
      };
      selectedRange = range;
    }
  };

  const handleInjectingMarkAndClickListener = (noteId) => {
    handleInjectingMark(noteId, selectedRange, highlightColor);
    const marks = document.getElementsByClassName(noteId);
    const markOnClick = (mark) => (event) => {
      event.stopPropagation();
      setAnchorEl(null);
      if (window.getSelection().isCollapsed) {
        setAnchorEl(mark);
      }
    };
    for (const mark of marks) {
      addListener(mark, "click", markOnClick(mark));
    }
  };

  const handleDeleteMark = (markId) =>
    disableHighlightNodes(document.getElementsByClassName(markId));

  const handleUpdateHighlight = (noteId) => {
    const marks = document.getElementsByClassName(noteId);
    for (const mark of marks) {
      mark.style.backgroundColor = highlightColor;
    }
  };

  const handleCloseAnnotator = () => {
    annotatorOpen.current = false;
    const updatedMemo = (memos[textToMemoKeyFormat.current] ?? "") !== memo;
    let noteId =
      selectedAnchor === null ? anchorEl?.getAttribute("noteid") : null;
    const updatedNoteHighlight =
      (notes[spineIndex]?.[noteId]?.highlightColor ?? null) !== highlightColor;
    const updatedNoteText = (notes[spineIndex]?.[noteId]?.note ?? "") !== note;
    const updatedNote = updatedNoteText || updatedNoteHighlight;
    const updateDB = updatedMemo || updatedNote;
    if (updatedMemo) {
      if (memo.length > 0) {
        memos[textToMemoKeyFormat.current] = memo;
      } else {
        delete memos[textToMemoKeyFormat.current];
      }
    }

    const updateData = { key: entryId };
    if (updatedNote) {
      if (note.length > 0 || highlightColor !== null) {
        let newNote = !noteId;
        noteId = noteId ?? getNewId();
        if (newNote) {
          handleInjectingMarkAndClickListener(noteId);
          if (notes.hasOwnProperty(spineIndex) === false) {
            notes[spineIndex] = {};
          }
          notes[spineIndex][noteId] = {
            note: note,
            spineIndex,
            highlightColor,
            selectedText,
            dateCreated: Date.now(),
            selectedRangeIndexed,
          };
        } else {
          if (updatedNoteHighlight) {
            handleUpdateHighlight(noteId);
            notes[spineIndex][noteId].highlightColor = highlightColor;
          }
          if (updatedNoteText) {
            notes[spineIndex][noteId].note = note;
          }
        }
      } else if (noteId) {
        notes[spineIndex][noteId].deleted = true;
        handleDeleteMark(noteId);
        noteId = null;
      }
      updateData.notes = notes;
    }

    if (updatedMemo) {
      updateData.memos = memos;
    }
    if (updateDB) {
      updateEpubData(updateData);
    }
    setAnchorEl(null);
    setSelectedAnchor(null);
  };

  const handleTextAreaOnChange = (event) => {
    if (tabValueMap[currentTabValue] === "memo") {
      setMemo(event?.target?.value ?? "");
    } else if (tabValueMap[currentTabValue] === "note") {
      setNote(event?.target?.value ?? "");
    }
  };

  const handleTouchSelect = () => {
    if (oldTouchSelect.current) {
      setTimeout(() => {
        if (window.getSelection().isCollapsed === false) {
          handleGetTextSelection();
        }
      }, 100);
      oldTouchSelect.current = null;
    } else if (window.getSelection().isCollapsed === false) {
      oldTouchSelect.current = true;
    } else {
      oldTouchSelect.current = null;
    }
  };

  React.useEffect(() => {
    document
      .getElementById("content")
      .addEventListener("mouseup", handleGetTextSelection);
    document.addEventListener("touchend", handleTouchSelect);
    return () => {
      document
        .getElementById("content")
        ?.removeEventListener("mouseup", handleGetTextSelection);
      document.removeEventListener("touchend", handleTouchSelect);
    };
  }, []);

  return (
    <Backdrop open={openAnnotator}>
      <Menu
        id="annotator-menu"
        anchorEl={selectedAnchor || anchorEl}
        open={openAnnotator}
        onClose={handleCloseAnnotator}
        anchorOrigin={{
          vertical:
            !anchorEl && selectedAnchor && selectionParentRect && selectionRect
              ? selectionRect.top > Math.floor(window.innerHeight / 2)
                ? selectionRect.bottom -
                  selectionParentRect.top -
                  selectionRect.height / 2 -
                  20
                : selectionRect.bottom -
                  selectionParentRect.top -
                  selectionRect.height / 2 +
                  20
              : anchorEl
              ? anchorEl.getBoundingClientRect().top >
                Math.floor(window.innerHeight / 2)
                ? -anchorEl.getBoundingClientRect().height / 2
                : anchorEl.getBoundingClientRect().height
              : -20,
          horizontal:
            selectionParentRect && selectionRect
              ? selectionRect.right -
                selectionParentRect.left -
                selectionRect.width / 2
              : "center",
        }}
        transformOrigin={{
          vertical:
            (anchorEl?.getBoundingClientRect()?.top ??
              selectionRect?.top ??
              0) > Math.floor(window.innerHeight / 2)
              ? "bottom"
              : "top",
          horizontal: "center",
        }}
      >
        <Stack
          sx={{
            width: `${annotatorWidth}px`,
            padding: 1,
          }}
          spacing={1}
        >
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <HtmlTooltip
              title={
                <Typography variant="subtitle2">{selectedText}</Typography>
              }
              placement="left"
              enterDelay={100}
              enterNextDelay={100}
            >
              <Typography variant="h6" noWrap>
                {selectedText}
              </Typography>
            </HtmlTooltip>
            {(tabValueMap[currentTabValue] === "memo" && memo.length > 0) ||
            (tabValueMap[currentTabValue] === "note" &&
              (note.length > 0 || highlightColor)) ? (
              <Tooltip title={"Clear"}>
                <IconButton
                  onClick={() => handleClear(tabValueMap[currentTabValue])}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton disabled>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
          <Divider />
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
                      "If no highlight color is selected and a note is written, the highlight will be transparent."
                    }
                  </Typography>
                </Stack>
              }
              placement="left"
              enterDelay={300}
              enterNextDelay={300}
            >
              <SmallTab
                icon={<NotesIcon />}
                iconPosition="end"
                label="Note"
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
              placement="right"
            >
              <SmallTab
                icon={<StickyNote2Icon />}
                iconPosition="end"
                label="Memo"
                tabpanelheight={tabPanelHeight}
              />
            </HtmlTooltip>
          </SmallTabs>
          <Textarea
            value={tabValueMap[currentTabValue] === "memo" ? memo : note}
            onChange={handleTextAreaOnChange}
            onKeyDown={(event) => event.stopPropagation()}
            sx={{
              [`&:focus`]: { boxShadow: "inherit", borderColor: `inherit` },
              [`&:hover:focus`]: {
                borderColor: `inherit`,
              },
            }}
            minRows={3}
          />
          {tabValueMap[currentTabValue] === "note" && (
            <SimpleColorPicker
              color={highlightColor}
              handleRadioOnClick={handleHighlightColorClick}
              handleRadioChange={handleHighlightColorChange(false)}
              handleTextFieldChange={handleHighlightColorChange(true)}
            />
          )}
        </Stack>
      </Menu>
    </Backdrop>
  );
};

Annotator.propTypes = {
  entryId: PropTypes.string.isRequired,
  memos: PropTypes.object.isRequired,
  notes: PropTypes.object.isRequired,
  clearSearchMarkNode: PropTypes.func.isRequired,
  spineIndex: PropTypes.number.isRequired,
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func.isRequired,
};
