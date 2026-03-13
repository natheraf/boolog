import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { Backdrop, Box, Divider, Menu, Stack, Typography } from "@mui/material";
import {
  clearTemporaryMarks,
  getActualEndContainer,
  getFirstTextNode,
  getLastTextNode,
  getPreviousTextNode,
  handleInjectingMarkToEpubNodes,
  handleInjectingMarkToTextNodes,
  getTrimmedSelectedRange,
  waitForElements,
  getNearestEpubAncestor,
} from "../domUtils";
import { formatMemoKey } from "../formattingUtils";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { AnnotatorLeftSideBar } from "./AnnotatorLeftSideBar";
import { AnnotatorNotes } from "./AnnotatorNotes";

export const AnnotatorV2 = ({
  epubObject,
  spineIndex,
  anchorEl,
  setAnchorEl,
}) => {
  const theme = useTheme();
  const noteIdAttribute = "noteid";
  const annotatorWidth = 300;
  const annotatorHeight = 300;
  const highlightMouseUpTimeout = 200;

  const memos = epubObject.memos;
  const notes = epubObject.notes;

  const openAnnotator = Boolean(anchorEl);

  const appearTop = React.useRef(true);
  const selectedText = React.useRef(null);
  const textInMemoKeyFormat = React.useRef(null);

  const memo = React.useRef(null);

  const [currentTabIndex, setCurrentTabIndex] = React.useState(1);
  const optionTabs = [
    { title: "Note", icon: BorderColorIcon, value: "note" },
    { title: "Memo", icon: StickyNote2Icon, value: "memo" },
  ];

  const [noteValue, setNoteValue] = React.useState(
    notes[spineIndex]?.[anchorEl?.getAttribute(noteIdAttribute)]?.note ?? ""
  );
  const [highlightColor, setHighlightColor] = React.useState(null);

  const selectedRangeIndexed = React.useRef(null);
  const selectedRange = React.useRef(null);

  const selectedWidestWidth = React.useRef(0);
  const anchorElRect = anchorEl?.getBoundingClientRect();
  const getHorizontalOffset = () => {
    return (anchorElRect?.width ?? 0) / 2 - annotatorWidth / 2;
  };
  const getVerticalOffset = () => {
    if (anchorEl) {
      if (appearTop.current) {
        return -annotatorHeight - 20;
      } else {
        return (anchorElRect?.height ?? 0) + 10;
      }
    } else {
      return -20;
    }
  };

  const chooseTabForSelectedString = (selectedString) => {
    return selectedString.includes(" ") &&
      selectedString.indexOf(" ") !== selectedString.lastIndexOf(" ")
      ? optionTabs.findIndex((entry) => entry.value === "note")
      : optionTabs.findIndex((entry) => entry.value === "memo");
  };

  const handleOnChangeTab = (_event, value) => {
    setCurrentTabIndex(value);
  };

  const handleCloseAnnotator = () => {
    clearTemporaryMarks();
    setAnchorEl(null);
  };

  const mouseUpTimeout = React.useRef(null);

  const clearMouseUpTimeout = () => {
    clearTimeout(mouseUpTimeout.current);
  };

  const handleUpDown = () => {
    clearMouseUpTimeout();
    mouseUpTimeout.current = setTimeout(
      handleGetTextSelection,
      highlightMouseUpTimeout
    );
  };

  const handleGetTextSelection = () => {
    const selectedString = window.getSelection()?.toString()?.trim();
    if (openAnnotator === false && selectedString?.length > 0) {
      const selection = window.getSelection();
      const epubAnchorNode = getNearestEpubAncestor(selection.anchorNode);
      const epubFocusNode = getNearestEpubAncestor(selection.focusNode);
      if (
        !epubAnchorNode ||
        !epubFocusNode ||
        !(
          epubAnchorNode.getAttribute("nodeid") &&
          epubAnchorNode.classList.contains("epub-node")
        ) ||
        !(
          epubFocusNode.getAttribute("nodeid") &&
          epubFocusNode.classList.contains("epub-node")
        )
      ) {
        return;
      }
      clearTemporaryMarks();
      selectedText.current = selectedString;
      // removes possessive form
      textInMemoKeyFormat.current = formatMemoKey(selectedString);
      memo.current = memos[textInMemoKeyFormat.current]?.memo ?? "";
      // if 2 spaces, probably a note
      handleOnChangeTab(null, chooseTabForSelectedString(selectedString));
      setHighlightColor(null);
      setNoteValue("");

      const range = selection.getRangeAt(0);
      const selectedRange = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
      };
      selection.empty();

      // fix bug if element ends with br (or an html element)
      if (selectedRange.endContainer instanceof HTMLElement) {
        if (
          selectedRange.endContainer !== selectedRange.startContainer &&
          selectedRange.endContainer.contains(selectedRange.startContainer)
        ) {
          const lastNode = getLastTextNode(selectedRange.endContainer);
          selectedRange.endContainer = lastNode;
          selectedRange.endOffset = lastNode.length;
        } else {
          const firstNode = getFirstTextNode(selectedRange.endContainer);
          selectedRange.endContainer = firstNode;
          selectedRange.endOffset = 0;
        }
      }

      const [trimmedStartOffset, trimmedEndOffset] =
        getTrimmedSelectedRange(selectedRange);
      selectedRange.startOffset = trimmedStartOffset;
      selectedRange.endOffset = trimmedEndOffset;

      const startNode = selectedRange.startContainer;
      const endNode = selectedRange.endContainer;
      let startContainerParent = startNode.parentElement;
      while (startContainerParent.classList.contains("epub-node") === false) {
        startContainerParent = startContainerParent.parentElement;
      }
      selectedRange.startContainer = startContainerParent;
      let endContainerParent = endNode.parentElement;
      while (endContainerParent.classList.contains("epub-node") === false) {
        endContainerParent = endContainerParent.parentElement;
      }
      selectedRange.endContainer = endContainerParent;

      let startOffsetFromParent = selectedRange.startOffset;
      let walker = document.createTreeWalker(
        startContainerParent,
        NodeFilter.SHOW_TEXT
      );
      while (walker.nextNode()) {
        const textNode = walker.currentNode;
        if (startNode.contains(textNode)) {
          break;
        }
        startOffsetFromParent += textNode.textContent.length;
      }
      selectedRange.startOffset = startOffsetFromParent;

      let endOffsetFromParent = selectedRange.endOffset;
      walker = document.createTreeWalker(
        endContainerParent,
        NodeFilter.SHOW_TEXT
      );
      while (walker.nextNode()) {
        const textNode = walker.currentNode;
        if (endNode.contains(textNode)) {
          break;
        }
        endOffsetFromParent += textNode.textContent.length;
      }
      selectedRange.endOffset = endOffsetFromParent;

      [selectedRange.endContainer, selectedRange.endOffset] =
        getActualEndContainer(selectedRange);

      selectedRangeIndexed.current = {
        startContainerId: selectedRange.startContainer.getAttribute("nodeid"),
        startOffset: selectedRange.startOffset,
        endContainerId: selectedRange.endContainer.getAttribute("nodeid"),
        endOffset: selectedRange.endOffset,
      };

      handleInjectingMarkToEpubNodes(
        document,
        null,
        selectedRange,
        "",
        "temporary-mark"
      );

      waitForElements(".temporary-mark").then((elements) => {
        const topElement = elements[0];
        const bottomElement = elements[elements.length - 1];
        const topSpace = topElement.getBoundingClientRect().top;
        const bottomSpace =
          window.innerHeight - bottomElement.getBoundingClientRect().bottom;
        selectedWidestWidth.current = 0;
        elements.forEach(
          (element) =>
            (selectedWidestWidth.current = Math.max(
              selectedWidestWidth.current,
              element.getBoundingClientRect().width
            ))
        );
        if (bottomSpace < annotatorHeight * 1.1) {
          appearTop.current = true;
          setAnchorEl(topElement);
        } else {
          appearTop.current = false;
          setAnchorEl(bottomElement);
        }
      });
    }
  };

  React.useEffect(() => {
    // document.addEventListener("mousedown", clearTemporaryMarks);
    document.addEventListener("mouseup", handleUpDown);
    document.addEventListener("mousedown", clearMouseUpTimeout);
    // document.addEventListener("touchend", handleTouchSelect);
    document.addEventListener("touchstart", clearTemporaryMarks);
    return () => {
      // document.removeEventListener("mousedown", clearTemporaryMarks);
      document.removeEventListener("mouseup", handleUpDown);
      clearTimeout(mouseUpTimeout.current);
      document.removeEventListener("mousedown", clearMouseUpTimeout);
      // document.removeEventListener("touchend", handleTouchSelect);
      document.removeEventListener("touchstart", clearTemporaryMarks);
    };
  }, []);

  return (
    <Backdrop
      open={openAnnotator}
      sx={{ zIndex: 1 /** to show above side buttons */ }}
    >
      {anchorEl && (
        <Menu
          id="annotator-menu"
          anchorEl={anchorEl}
          open={openAnnotator}
          onClose={handleCloseAnnotator}
          anchorOrigin={{
            vertical: getVerticalOffset(),
            horizontal: getHorizontalOffset(),
          }}
          slotProps={{
            paper: {
              sx: {
                overflow: "visible",
              },
            },
          }}
        >
          <Stack
            direction={"row"}
            sx={{ position: "relative", overflow: "visible" }}
          >
            <AnnotatorLeftSideBar
              optionTabs={optionTabs}
              currentTabIndex={currentTabIndex}
              setCurrentTabIndex={setCurrentTabIndex}
            />
            <Box sx={{ width: annotatorWidth, height: annotatorHeight }}>
              {optionTabs[currentTabIndex].value === "note" ? (
                <AnnotatorNotes selectedText={selectedText.current} />
              ) : (
                "test"
              )}
            </Box>
          </Stack>
        </Menu>
      )}
    </Backdrop>
  );
};

AnnotatorV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func.isRequired,
};
