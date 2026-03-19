import * as React from "react";
import { Box, CircularProgress, Dialog, Stack } from "@mui/material";
import { HeaderV2 } from "./HeaderV2";
import { DialogSlideUpTransition } from "../../CustomComponents";
import PropTypes from "prop-types";
import { updateEpubDataInDotNotation } from "../../../api/IndexedDB/epubData";
import { ViewRenderer } from "./ViewRenderer";
import { loadImages } from "../epubUtils";
import { useTheme } from "@emotion/react";
import { AnnotatorV2 } from "./AnnotatorV2";
import { clearTemporaryMarks, waitForElement } from "../domUtils";

/**
 * Main wrapper for epub reader v2. Epub state manager.
 * @param {*} param0
 * @returns
 */
export const EpubReaderV2 = ({ epubObject, setOpenEpubReader }) => {
  const theme = useTheme();
  const spine = epubObject.spine;
  const timeOutToSetProgress = React.useRef(null);
  const [progress, setProgress] = React.useState({
    spine: epubObject.progress.spine,
    part: epubObject.progress.part,
  });
  const [history, setHistory] = React.useState([
    {
      spine: epubObject.progress.spine,
      part: epubObject.progress.part,
    },
  ]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [displayOptions, setDisplayOptions] = React.useState(
    epubObject.displayOptions
  );
  const [forceFocus, setForceFocus] = React.useState(null);

  const [formatting, setFormatting] = React.useState(epubObject.formatting);
  const [formatMenuIsOpen, setFormatMenuIsOpen] = React.useState(false);

  const [loadedCSS, setLoadedCSS] = React.useState(false);

  const [preparedSpineIndexes, setPreparedSpineIndexes] = React.useState([]);
  const imageObjectURLs = React.useRef(new Map());

  const [annotatorAnchorEl, setAnnotatorAnchorEl] = React.useState(null);

  const [renderAnnotator, setRenderAnnotator] = React.useState(false);

  console.log(epubObject);
  const handleClose = () => {
    setOpenEpubReader(false);
  };

  const handleHistoryChange = (
    spine,
    part,
    isHistoryEntry,
    doNotAddToHistory
  ) => {
    if (isHistoryEntry) {
      return setForceFocus({ type: "partProgress" });
    }
    const newHistoryEntryIsNotDuplicateOfPrevious =
      history[historyIndex]?.spine !== spine ||
      history[historyIndex]?.part !== part;
    if (
      isHistoryEntry !== true &&
      doNotAddToHistory !== true &&
      newHistoryEntryIsNotDuplicateOfPrevious
    ) {
      const newHistoryArray = [
        ...history.slice(0, historyIndex + 1),
        { spine, part },
      ];
      setHistory(newHistoryArray);
      setHistoryIndex(newHistoryArray.length - 1);
    }
  };

  const setProgressHelper = (
    spineProgress,
    partProgress,
    isHistoryEntry = false,
    doNotAddToHistory = false
  ) => {
    console.log(spineProgress, partProgress);
    spineProgress = Math.min(Math.max(0, spineProgress), spine.length - 1);
    epubObject.progress.spine = spineProgress;
    epubObject.progress.part = partProgress;
    prepareSpineIndex(spineProgress);
    setForceFocus(null);
    setProgress({ spine: spineProgress, part: partProgress });
    handleHistoryChange(
      spineProgress,
      partProgress,
      isHistoryEntry,
      doNotAddToHistory
    );
    clearTimeout(timeOutToSetProgress.current);
    timeOutToSetProgress.current = setTimeout(() => {
      updateEpubDataInDotNotation({
        key: epubObject.key,
        progress: { spine: spineProgress, part: partProgress },
      });
    }, 500);
  };

  const setProgressIsHistoryEntry = (spine, part) => {
    setProgressHelper(spine, part, true);
  };

  const setProgressWithoutAddingHistory = (spine, part) => {
    setProgressHelper(spine, part, false, true);
  };

  const prepareSpineIndex = (spineIndex) => {
    for (
      let index = Math.max(0, spineIndex - 1);
      index < Math.min(spine.length, spineIndex + 2);
      index += 1
    ) {
      if (preparedSpineIndexes.includes(index)) {
        continue;
      }
      loadImages(epubObject, index, imageObjectURLs.current);
      setPreparedSpineIndexes((prev) =>
        prev.includes(index) ? prev : [...prev, index]
      );
    }
  };

  React.useEffect(() => {
    prepareSpineIndex(progress.spine);
    waitForElement("#content").then(() => setRenderAnnotator(true));
    document.addEventListener("mousedown", clearTemporaryMarks);
    document.addEventListener("touchstart", clearTemporaryMarks);
    return () => {
      imageObjectURLs.current.keys().forEach(URL.revokeObjectURL);
      document.removeEventListener("mousedown", clearTemporaryMarks);
      document.addEventListener("touchstart", clearTemporaryMarks);
    };
  }, []);

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
    >
      {displayOptions.view && (
        <Box
          sx={{
            height: window.innerHeight,
            display: "flex",
            flexFlow: "column",
          }}
        >
          <HeaderV2
            sx={{ flex: "0 1 auto" }}
            epubObject={epubObject}
            spineIndex={progress.spine}
            handleClose={handleClose}
            formatting={formatting}
            setFormatting={setFormatting}
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
            history={history}
            historyIndex={historyIndex}
            setHistoryIndex={setHistoryIndex}
            setProgress={setProgressHelper}
            setProgressIsHistoryEntry={setProgressIsHistoryEntry}
            setProgressWithoutAddingHistory={setProgressWithoutAddingHistory}
            setLoadedCSS={setLoadedCSS}
            setFormatMenuIsOpen={setFormatMenuIsOpen}
            setForceFocus={setForceFocus}
          />
          <Box
            id="epub-body"
            sx={{
              backgroundColor: formatting.pageColor,
              flex: "1 1 auto",
              overflowY: "auto",
              width: "100%",
              scrollbarColor: `${formatting.textColor} ${formatting.pageColor}`,
              scrollbarWidth: "thin",
            }}
          >
            {loadedCSS &&
            (progress.spine === 0 ||
              preparedSpineIndexes.includes(progress.spine - 1)) &&
            preparedSpineIndexes.includes(progress.spine) &&
            (progress.spine + 1 === spine.length ||
              preparedSpineIndexes.includes(progress.spine + 1)) ? (
              <ViewRenderer
                epubObject={epubObject}
                spineIndex={progress.spine}
                partProgress={progress.part}
                forceFocus={forceFocus}
                setForceFocus={setForceFocus}
                formatting={formatting}
                setProgress={setProgressHelper}
                setProgressWithoutAddingHistory={
                  setProgressWithoutAddingHistory
                }
                displayOptions={displayOptions}
                formatMenuIsOpen={formatMenuIsOpen}
              />
            ) : (
              <Stack
                sx={{
                  width: "100%",
                  height: "100%",
                }}
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress disableShrink />
              </Stack>
            )}
          </Box>
          {renderAnnotator && (
            <AnnotatorV2
              epubObject={epubObject}
              displayOptions={displayOptions}
              spineIndex={progress.spine}
              anchorEl={annotatorAnchorEl}
              setAnchorEl={setAnnotatorAnchorEl}
            />
          )}
        </Box>
      )}
    </Dialog>
  );
};

EpubReaderV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  setOpenEpubReader: PropTypes.func.isRequired,
};
