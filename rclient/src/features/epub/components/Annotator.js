import * as React from "react";
import {
  Backdrop,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Menu,
  Radio,
  RadioGroup,
  Stack,
  styled,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import NotesIcon from "@mui/icons-material/Notes";
import { Textarea } from "../../../components/Textarea";
import { tooltipClasses } from "@mui/material/Tooltip";
import { updatePreference } from "../../../api/IndexedDB/userPreferences";
import PropTypes from "prop-types";
import { getNewId } from "../../../api/IndexedDB/common";
import { common } from "@mui/material/colors";

const SmallTabs = styled(Tabs)(({ tabpanelheight }) => ({
  height: tabpanelheight,
  minHeight: tabpanelheight,
  ".MuiTabs-indicator": {
    borderRadius: "5px",
  },
}));
const SmallTab = styled(Tab)(({ tabpanelheight }) => ({
  height: tabpanelheight,
  minHeight: tabpanelheight,
  borderRadius: "5px",
}));
const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
  },
}));

let selectedRange = null;

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
  const [selectedAnchor, setSelectedAnchor] = React.useState(null);
  const openAnnotator = Boolean(anchorEl || selectedAnchor);
  const annotatorOpen = React.useRef(false);

  const [currentTabValue, setCurrentTabValue] = React.useState(0);
  const tabValueMap = ["memo", "note"];

  const [memo, setMemo] = React.useState("");
  const [note, setNote] = React.useState(
    notes[anchorEl?.getAttribute("noteid")]?.note ?? ""
  );
  const [highlightColor, setHighlightColor] = React.useState(
    notes[anchorEl?.getAttribute("noteid")]?.highlightColor ?? null
  );

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
      setSelectionParentRect(
        selection.anchorNode.parentElement.getBoundingClientRect()
      );
      setSelectionRect(selection.getRangeAt(0).getBoundingClientRect());
      setSelectedText(selectedString);
      setSelectedAnchor(selection.anchorNode.parentElement);
      annotatorOpen.current = true;
      setMemo(memos[selectedString] ?? "");

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
  };

  const handleDeleteMark = (markId) => {
    const marks = document.getElementsByClassName(markId);
    const updates = [];
    for (const mark of marks) {
      const frag = document.createDocumentFragment();
      while (mark.firstChild) {
        frag.appendChild(mark.firstChild);
      }
      updates.push([mark, frag]);
    }
    updates.forEach(([mark, frag]) => {
      const parent = mark.parentElement;
      parent.insertBefore(frag, mark);
      parent.removeChild(mark);
    });
  };

  const handleUpdateHighlight = (noteId) => {
    const marks = document.getElementsByClassName(noteId);
    for (const mark of marks) {
      mark.style.backgroundColor = highlightColor;
    }
  };

  const handleCloseAnnotator = () => {
    annotatorOpen.current = false;
    const updatedMemo = (memos[selectedText] ?? "") !== memo;
    let noteId =
      selectedAnchor === null ? anchorEl?.getAttribute("noteid") : null;
    const updatedHighlight =
      (notes[noteId]?.highlightColor ?? null) !== highlightColor;
    const updatedNote =
      (notes[noteId]?.note ?? "") !== note || updatedHighlight;
    const updateDB = updatedMemo || updatedNote;
    if (updatedMemo) {
      if (memo.length > 0) {
        memos[selectedText] = memo;
      } else {
        delete memos[selectedText];
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
        notes[noteId] = { note, spineIndex, highlightColor, selectedText };
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
      updatePreference(updateData);
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

  React.useEffect(() => {
    document
      .getElementById("content")
      .addEventListener("mouseup", handleGetTextSelection);
    return () =>
      document
        .getElementById("content")
        ?.removeEventListener("mouseup", handleGetTextSelection);
  }, []);

  return (
    <Backdrop open={openAnnotator}>
      <Menu
        anchorEl={selectedAnchor || anchorEl}
        open={openAnnotator}
        onClose={handleCloseAnnotator}
        anchorOrigin={{
          vertical:
            selectionParentRect && selectionRect
              ? selectionRect.bottom -
                selectionParentRect.top -
                selectionRect.height / 2 -
                20
              : -10,
          horizontal:
            selectionParentRect && selectionRect
              ? selectionRect.right -
                selectionParentRect.left -
                selectionRect.width / 2
              : "center",
        }}
        transformOrigin={{
          vertical: "bottom",
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
          <HtmlTooltip
            title={<Typography variant="subtitle2">{selectedText}</Typography>}
            placement="left"
            enterDelay={100}
            enterNextDelay={100}
          >
            <Typography variant="h6" noWrap>
              {selectedText}
            </Typography>
          </HtmlTooltip>
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
              placement="left"
            >
              <SmallTab
                icon={<StickyNote2Icon />}
                iconPosition="end"
                label="Memo"
                tabpanelheight={tabPanelHeight}
              />
            </HtmlTooltip>
            <Tooltip
              title="Notes are added to the current word/phrase"
              enterDelay={300}
              enterNextDelay={300}
              placement="right"
            >
              <SmallTab
                icon={<NotesIcon />}
                iconPosition="end"
                label="Note"
                tabpanelheight={tabPanelHeight}
              />
            </Tooltip>
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
            <FormControl component={Stack} spacing={1}>
              <Stack>
                <Tooltip
                  title="You can only see the note in Notes tab if no highlight is selected"
                  placement="left"
                  enterDelay={100}
                  enterNextDelay={100}
                >
                  <FormLabel>{"Highlight Color"}</FormLabel>
                </Tooltip>
                <RadioGroup
                  row
                  name="highlight-color-radio-group"
                  sx={{ paddingLeft: 1 }}
                  value={highlightColor}
                  onChange={handleHighlightColorChange(false)}
                >
                  {[
                    { value: "255, 255, 0", label: "Yellow" },
                    { value: "255, 0, 0", label: "Red" },
                    { value: "0, 255, 0", label: "green" },
                    { value: "0, 0, 255", label: "Blue" },
                  ].map((obj) => (
                    <FormControlLabel
                      key={obj.value}
                      value={`rgba(${obj.value}, .2)`}
                      control={
                        <Radio
                          sx={{
                            color: `rgb(${obj.value})`,
                            "&.Mui-checked": {
                              color: `rgb(${obj.value})`,
                            },
                          }}
                        />
                      }
                      onClick={() => handleHighlightColorClick(obj.value)}
                    />
                  ))}
                </RadioGroup>
              </Stack>
              <Stack spacing={1}>
                <Tooltip
                  title="Enter a color name, RGB, HEX, or HSL"
                  placement="left"
                >
                  <FormLabel>Custom</FormLabel>
                </Tooltip>
                <TextField
                  value={highlightColor ?? ""}
                  onChange={handleHighlightColorChange(true)}
                  size="small"
                />
              </Stack>
            </FormControl>
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
