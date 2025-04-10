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
import { deleteNodesAndLiftChildren } from "../domUtils";

let selectedRange = null;

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
  spineOverride,
}) => {
  const annotatorHeight = 200;
  const annotatorWidth = 300;
  const tabPanelHeight = 30;
  const [selectionParentRect, setSelectionParentRect] = React.useState(null);
  const [selectionRect, setSelectionRect] = React.useState(null);
  const [selectedText, setSelectedText] = React.useState(
    notes[anchorEl?.getAttribute("noteid")]?.selectedText ?? null
  );
  const memoKeyOfHighlight = formatMemoKey(
    notes[anchorEl?.getAttribute("noteid")]?.selectedText
  );
  const textToMemoKeyFormat = React.useRef(memoKeyOfHighlight);
  const [selectedAnchor, setSelectedAnchor] = React.useState(null);
  const openAnnotator = Boolean(anchorEl || selectedAnchor);
  const annotatorOpen = React.useRef(false);

  const tabValueMap = ["note", "memo"];
  const [currentTabValue, setCurrentTabValue] = React.useState(
    notes[anchorEl?.getAttribute("noteid")]
      ? tabValueMap.indexOf("note")
      : tabValueMap.indexOf("memo")
  );

  const [memo, setMemo] = React.useState(
    memoKeyOfHighlight ? memos[memoKeyOfHighlight] ?? "" : ""
  );
  const [note, setNote] = React.useState(
    notes[anchorEl?.getAttribute("noteid")]?.note ?? ""
  );
  const [highlightColor, setHighlightColor] = React.useState(
    notes[anchorEl?.getAttribute("noteid")]?.highlightColor ?? null
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

      selectedRange = range;
    }
  };

  const markNode = (node, noteId) => {
    if ((node.textContent?.trim()?.length ?? 0) === 0) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const mark = document.createElement("span");
      mark.classList.add(noteId, "mark");
      mark.setAttribute("noteid", noteId);
      mark.style.backgroundColor = highlightColor;
      mark.style.fontSize = "inherit";
      mark.style.fontWeight = "inherit";
      node.parentNode.replaceChild(mark, node);
      mark.appendChild(node);
      return;
    }
    for (const child of node.childNodes) {
      markNode(child, noteId);
    }
  };

  const injectMarkToNode = (node, noteId, index, start, end) => {
    const length = node.textContent.length;
    if (index + length < start) {
      return length;
    }
    if (start <= index && index + length <= end) {
      markNode(node, noteId);
      return length;
    }
    if (node.nodeType !== Node.TEXT_NODE) {
      for (const child of [...node.childNodes]) {
        index += injectMarkToNode(child, noteId, index, start, end);
        if (index > end) {
          break;
        }
      }
      return length;
    }
    if (start <= index && end <= index + length) {
      const notMarked = node.splitText(length - (index + length - end));
      node.parentNode.replaceChild(notMarked, node);
      notMarked.parentNode.insertBefore(node, notMarked);
      markNode(node, noteId);
      notMarked.parentNode.normalize();
    } else if (start >= index && index + length <= end) {
      const marked = node.splitText(start - index);
      node.parentNode.replaceChild(marked, node);
      marked.parentNode.insertBefore(node, marked);
      markNode(marked, noteId);
      node.parentNode.normalize();
    } else {
      // between: index > start && end < index + length
      const unmarkedEnd = node.splitText(length - (index + length - end));
      const markedBetween = node.splitText(start - index);
      node.parentNode.replaceChild(unmarkedEnd, node);
      unmarkedEnd.parentNode.insertBefore(markedBetween, unmarkedEnd);
      markedBetween.parentNode.insertBefore(node, markedBetween);
      markNode(markedBetween, noteId);
      node.parentNode.normalize();
    }
    return length;
  };

  const handleInjectingMark = (noteId) => {
    if (selectedRange.startContainer === selectedRange.endContainer) {
      injectMarkToNode(
        selectedRange.startContainer,
        noteId,
        0,
        selectedRange.startOffset,
        selectedRange.endOffset
      );
    } else {
      let it = selectedRange.startContainer;
      while (it.nextSibling === null) {
        it = it.parentNode;
      }
      let next = it.nextSibling;
      injectMarkToNode(it, noteId, 0, selectedRange.startOffset, Infinity);
      it = next;
      while (it !== selectedRange.endContainer) {
        if (it.contains(selectedRange.endContainer)) {
          it = it.firstChild;
        } else {
          markNode(it, noteId);
          while (it.nextSibling === null) {
            it = it.parentNode;
          }
          it = it.nextSibling;
        }
      }
      injectMarkToNode(it, noteId, 0, 0, selectedRange.endOffset);
    }

    const marks = document.getElementsByClassName(noteId);
    const markOnClick = (mark) => (event) => {
      event.stopPropagation();
      setAnchorEl(null);
      if (window.getSelection().isCollapsed) {
        setAnchorEl(mark);
      }
    };
    for (const mark of marks) {
      mark.addEventListener("click", markOnClick(mark));
    }
  };

  const handleDeleteMark = (markId) =>
    deleteNodesAndLiftChildren(document.getElementsByClassName(markId));

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
    const updatedHighlight =
      (notes[noteId]?.highlightColor ?? null) !== highlightColor;
    const updatedNote =
      (notes[noteId]?.note ?? "") !== note || updatedHighlight;
    const updateDB = updatedMemo || updatedNote;
    if (updatedMemo) {
      if (memo.length > 0) {
        memos[textToMemoKeyFormat.current] = memo;
      } else {
        delete memos[textToMemoKeyFormat.current];
      }
    }

    if (updatedNote) {
      if (note.length > 0 || highlightColor !== null) {
        let newNote = !noteId;
        noteId = noteId ?? getNewId();
        if (newNote) {
          handleInjectingMark(noteId);
        } else if (updatedHighlight) {
          handleUpdateHighlight(noteId);
        }
        notes[noteId] = {
          note: note,
          spineIndex,
          highlightColor,
          selectedText,
        };
      } else if (noteId) {
        delete notes[noteId];
        handleDeleteMark(noteId);
        noteId = null;
      }
    }

    const updateData = { key: entryId };
    if (updatedMemo) {
      updateData.memos = memos;
    }
    if (updatedNote) {
      if (spineOverride.hasOwnProperty(spineIndex) === false) {
        spineOverride[spineIndex] = {};
      }
      spineOverride[spineIndex].element =
        document.getElementById("inner-content").outerHTML;
      updateData.notes = notes;
      updateData.spineOverride = spineOverride;
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
                      "If no highlight color is selected, the highlight will be transparent."
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
  spineOverride: PropTypes.object.isRequired,
};
