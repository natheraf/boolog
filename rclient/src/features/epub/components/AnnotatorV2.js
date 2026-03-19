import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { Backdrop, Box, Menu, Stack } from "@mui/material";
import {
  clearTemporaryMarks,
  handleInjectingMarkToEpubNodes,
  trimSelectedRange,
  getNearestEpubAncestor,
  setRangeToTextNodesOnly,
  handleDeleteMark,
  isIOS,
} from "../domUtils";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { AnnotatorLeftSideBar } from "./AnnotatorLeftSideBar";
import { AnnotatorNotes } from "./AnnotatorNotes";
import { AnnotatorMemos } from "./AnnotatorMemos";

export const AnnotatorV2 = ({
  epubObject,
  displayOptions,
  spineIndex,
  anchorEl,
  setAnchorEl,
}) => {
  const notes = epubObject.notes;
  const theme = useTheme();
  const annotatorWidth = 300;
  const annotatorHeight = 300;
  const highlightMouseUpTimeout = 200;

  const openAnnotator = Boolean(anchorEl);

  const appearTop = React.useRef(true);
  const selectedText = React.useRef(null);

  const [currentTabIndex, setCurrentTabIndex] = React.useState(1);
  const tabOptions = [
    { title: "Note", icon: BorderColorIcon, value: "note" },
    { title: "Memo", icon: StickyNote2Icon, value: "memo" },
  ];

  const selectedRangeIndexed = React.useRef(null);
  const abortController = React.useRef(null);

  const selectedWidestWidth = React.useRef(0);
  const anchorElRect = anchorEl?.getBoundingClientRect();
  const getHorizontalOffset = () => {
    return (anchorElRect?.width ?? 0) / 2 - annotatorWidth / 2;
  };
  const getVerticalOffset = () => {
    if (anchorEl) {
      if (appearTop.current) {
        return -10;
      } else {
        return (anchorElRect?.height ?? 0) + 10;
      }
    } else {
      return -10;
    }
  };
  const getVerticalOrigin = () => {
    if (anchorEl) {
      if (appearTop.current) {
        return "bottom";
      } else {
        return "top";
      }
    } else {
      return "top";
    }
  };

  const chooseTabForSelectedString = (selectedString) => {
    return selectedString.includes(" ") &&
      selectedString.indexOf(" ") !== selectedString.lastIndexOf(" ")
      ? tabOptions.findIndex((entry) => entry.value === "note")
      : tabOptions.findIndex((entry) => entry.value === "memo");
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

  const handleMouseUp = () => {
    clearMouseUpTimeout();
    mouseUpTimeout.current = setTimeout(
      handleGetTextSelection,
      highlightMouseUpTimeout
    );
  };

  const oldTouchSelect = React.useRef(null);
  const handleTouchSelect = (event) => {
    const selection = window.getSelection();
    if (isIOS()) {
      if (oldTouchSelect.current) {
        setTimeout(() => {
          if (window.getSelection().isCollapsed === false) {
            handleGetTextSelection();
          }
        }, 100);
        oldTouchSelect.current = null;
      } else if (selection.isCollapsed === false) {
        oldTouchSelect.current = true;
      } else {
        oldTouchSelect.current = null;
      }
    } else {
      if (selection.isCollapsed === false) {
        event.preventDefault();
      }
      setTimeout(() => {
        if (window.getSelection().isCollapsed === false) {
          handleGetTextSelection();
        }
      }, 100);
    }
  };

  const handleGetTextSelection = () => {
    const selectedString = window.getSelection()?.toString()?.trim();
    if (openAnnotator === false && selectedString?.length > 0) {
      const selection = window.getSelection();
      clearTemporaryMarks();
      let range = selection.getRangeAt(0);
      if (range.collapsed) {
        range.setEnd(selection.anchorNode, selection.anchorOffset);
        range.setStart(selection.focusNode, selection.focusOffset);
      }
      selection.empty();
      selection.addRange(range);
      if (range.endOffset === 0 && range.endContainer instanceof HTMLElement) {
        selection.modify("extend", "backward", "character");
      }
      range = selection.getRangeAt(0);
      setRangeToTextNodesOnly(range);
      const content = document.getElementById("content");
      const startContainerInContent = content.contains(range.startContainer);
      const endContainerInContent = content.contains(range.endContainer);
      if (!startContainerInContent || !endContainerInContent) {
        return;
      }
      selectedText.current = selectedString;
      selection.empty();

      trimSelectedRange(range);

      const startNode = range.startContainer;
      const endNode = range.endContainer;
      let startContainerParent = getNearestEpubAncestor(startNode);
      let endContainerParent = getNearestEpubAncestor(endNode);

      let startOffsetFromParent = range.startOffset;
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

      let endOffsetFromParent = range.endOffset;
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

      const selectedRange = {
        startContainer: startContainerParent,
        startOffset: startOffsetFromParent,
        endContainer: endContainerParent,
        endOffset: endOffsetFromParent,
      };

      // if 2 spaces, probably a note
      handleOnChangeTab(null, chooseTabForSelectedString(selectedString));

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

      anchorToElementWithClass("temporary-mark");
    }
  };

  const anchorToElementWithClass = (className) => {
    const marks = [...document.getElementsByClassName(className)];
    const topElement = marks[0];
    const bottomElement = marks.at(-1);
    const topSpace = topElement.getBoundingClientRect().top;
    const bottomSpace =
      window.innerHeight - bottomElement.getBoundingClientRect().bottom;
    selectedWidestWidth.current = 0;
    marks.forEach(
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
  };

  const setTabToNotes = () =>
    setCurrentTabIndex(
      tabOptions.findIndex((option) => option.value === "note")
    );

  const onTouchEnd = (noteId, markText, markRangeIndexed) => (event) => {
    event.preventDefault();
    handleOpenMarkToAnnotator(
      noteId,
      markText,
      markRangeIndexed
    )(new Event(noteId));
  };
  const handleOpenMarkToAnnotator =
    (noteId, markText, markRangeIndexed) => (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (window.getSelection().isCollapsed) {
        setTabToNotes();
        anchorToElementWithClass(noteId);
        selectedText.current = markText;
        selectedRangeIndexed.current = markRangeIndexed;
      }
    };

  const attachContextMenuListenersToMarks = (
    noteId,
    markText,
    markRangeIndexed
  ) => {
    const marks = [...document.getElementsByClassName(noteId)];
    for (const mark of marks) {
      mark.addEventListener(
        "contextmenu",
        handleOpenMarkToAnnotator(noteId, markText, markRangeIndexed),
        {
          signal: abortController.current.signal,
        }
      );
      mark.addEventListener(
        "touchend",
        onTouchEnd(noteId, markText, markRangeIndexed),
        {
          signal: abortController.current.signal,
        }
      );
    }
  };

  const placeHighlights = () => {
    const spineIndexNotes = notes[spineIndex] ?? [];
    for (const [noteId, entry] of Object.entries(spineIndexNotes)) {
      const selectedRange = structuredClone(entry.selectedRangeIndexed);
      selectedRange.startContainer = document.querySelector(
        `[nodeId="${selectedRange.startContainerId}"]`
      );
      selectedRange.endContainer = document.querySelector(
        `[nodeId="${selectedRange.endContainerId}"]`
      );
      handleInjectingMarkToEpubNodes(
        document,
        noteId,
        selectedRange,
        entry.highlightColor,
        "mark"
      );
      attachContextMenuListenersToMarks(
        noteId,
        entry.selectedText,
        entry.selectedRangeIndexed
      );
    }
  };

  const deleteHighlights = () => {
    const spineIndexNotes = notes[spineIndex] ?? [];
    for (const noteId of Object.keys(spineIndexNotes)) {
      handleDeleteMark(noteId);
    }
  };

  React.useEffect(() => {
    abortController.current = new AbortController();
    placeHighlights();
    const content = document.getElementById("content");
    content.addEventListener("mouseup", handleMouseUp);
    content.addEventListener("mousedown", clearMouseUpTimeout);
    content.addEventListener("touchend", handleTouchSelect);
    return () => {
      abortController.current.abort();
      deleteHighlights();
      content.removeEventListener("mouseup", handleMouseUp);
      clearMouseUpTimeout();
      content.removeEventListener("mousedown", clearMouseUpTimeout);
      content.removeEventListener("touchend", handleTouchSelect);
    };
  }, [displayOptions.view, spineIndex]);

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
          transformOrigin={{
            vertical: getVerticalOrigin(),
            horizontal: 0,
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
              tabOptions={tabOptions}
              currentTabIndex={currentTabIndex}
              setCurrentTabIndex={setCurrentTabIndex}
            />
            <Box sx={{ width: annotatorWidth, height: annotatorHeight }}>
              {tabOptions[currentTabIndex].value === "note" ? (
                <AnnotatorNotes
                  epubObject={epubObject}
                  spineIndex={spineIndex}
                  selectedText={selectedText.current}
                  anchorEl={anchorEl}
                  selectedRangeIndexed={selectedRangeIndexed}
                  attachContextMenuListenersToMarks={
                    attachContextMenuListenersToMarks
                  }
                />
              ) : (
                <AnnotatorMemos
                  epubObject={epubObject}
                  selectedText={selectedText.current}
                />
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
  displayOptions: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  anchorEl: PropTypes.object,
  setAnchorEl: PropTypes.func.isRequired,
};
