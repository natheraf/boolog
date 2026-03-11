import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { Backdrop, Box, Menu, Stack } from "@mui/material";
import {
  clearTemporaryMarks,
  getFirstTextNode,
  getLastTextNode,
  getPreviousTextNode,
  handleInjectingMarkToTextNodes,
  waitForElements,
} from "../domUtils";
import { formatMemoKey } from "../formattingUtils";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { AnnotatorLeftSideBar } from "./AnnotatorLeftSideBar";

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

  const handleOnChangeTab = (event, value) => {
    setCurrentTabIndex(value);
    return;
    const textArea = document.getElementById("annotator-text-area");
    setTimeout(() => {
      if (textArea) {
        // textArea.focus();
        textArea.setSelectionRange(
          textArea.value.length,
          textArea.value.length
        );
      }
    });
  };

  const handleCloseAnnotator = () => {
    clearTemporaryMarks();
    setAnchorEl(null);
  };

  const handleGetTextSelection = () => {
    const selectedString = window.getSelection()?.toString()?.trim();
    if (openAnnotator === false && selectedString?.length > 0) {
      clearTemporaryMarks();
      const selection = window.getSelection();
      let focusNode = selection.focusNode;
      if (selection.focusOffset === 0) {
        focusNode = getPreviousTextNode(focusNode);
      }
      if (
        (!selection.anchorNode.parentElement.getAttribute("nodeid") &&
          !selection.anchorNode.parentElement.classList.contains("mark")) ||
        (!focusNode.parentElement.getAttribute("nodeid") &&
          !focusNode.parentElement.classList.contains("mark"))
      ) {
        return;
      }
      selectedText.current = selectedString;
      // removes possessive form
      textInMemoKeyFormat.current = formatMemoKey(selectedString);
      memo.current = memos[textInMemoKeyFormat.current]?.memo ?? "";
      // if 2 spaces, probably a note
      handleOnChangeTab(null, chooseTabForSelectedString(selectedString));
      setHighlightColor(null);
      setNoteValue("");

      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        range.setEnd(selection.anchorNode, selection.anchorOffset);
        range.setStart(selection.focusNode, selection.focusOffset);
      }
      selection.empty();

      // fix bug if element ends with br or user double click and highlights to the end of element
      if (range.endContainer instanceof HTMLElement) {
        if (
          range.endContainer !== range.startContainer &&
          range.endContainer.contains(range.startContainer)
        ) {
          const lastNode = getLastTextNode(range.endContainer);
          range.setEnd(lastNode, lastNode.length);
        } else {
          const firstNode = getFirstTextNode(range.endContainer);
          range.setEnd(firstNode, 0);
        }
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

      const startNode = range.startContainer;
      const endNode = range.endContainer;
      let startContainerParent = startNode.parentElement;
      while (startContainerParent.classList.contains("epub-node") === false) {
        startContainerParent = startContainerParent.parentElement;
      }
      let endContainerParent = endNode.parentElement;
      while (endContainerParent.classList.contains("epub-node") === false) {
        endContainerParent = endContainerParent.parentElement;
      }

      let startOffsetFromParent = startOffset;
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

      let endOffsetFromParent = endOffset;
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

      handleInjectingMarkToTextNodes(
        document,
        null,
        range,
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

      selectedRangeIndexed.current = {
        startContainerId: startContainerParent.getAttribute("nodeid"),
        startOffset: startOffsetFromParent,
        endContainerId: endContainerParent.getAttribute("nodeid"),
        endOffset: endOffsetFromParent,
      };
      selectedRange.current = range;
    }
  };

  React.useEffect(() => {
    // document.addEventListener("mousedown", clearTemporaryMarks);
    document.addEventListener("mouseup", handleGetTextSelection);
    // document.addEventListener("touchend", handleTouchSelect);
    document.addEventListener("touchstart", clearTemporaryMarks);
    return () => {
      // document.removeEventListener("mousedown", clearTemporaryMarks);
      document.removeEventListener("mouseup", handleGetTextSelection);
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
              test
            </Box>
          </Stack>
        </Menu>
      )}
    </Backdrop>
  );
};
