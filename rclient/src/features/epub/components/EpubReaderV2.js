import * as React from "react";
import { Box, CircularProgress, Dialog, Stack } from "@mui/material";
import { HeaderV2 } from "./HeaderV2";
import { DialogSlideUpTransition } from "../../CustomComponents";
import PropTypes from "prop-types";
import { updateEpubDataInDotNotation } from "../../../api/IndexedDB/epubData";
import { ViewRenderer } from "./ViewRenderer";
import { loadImages } from "../epubUtils";
import { getStateValue } from "../../../api/IndexedDB/State";
import { useTheme } from "@emotion/react";

/**
 * Main wrapper for epub reader v2. Epub state manager.
 * @param {*} param0
 * @returns
 */
export const EpubReaderV2 = ({ epubObject, setOpenEpubReader }) => {
  const theme = useTheme();
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
  const [view, setView] = React.useState(null);
  const [forceFocus, setForceFocus] = React.useState(null);

  const [formatting, setFormatting] = React.useState(epubObject.formatting);
  const [formatMenuIsOpen, setFormatMenuIsOpen] = React.useState(false);

  const [loadedCSS, setLoadedCSS] = React.useState(false);

  console.log(epubObject);
  const handleClose = () => {
    setOpenEpubReader(false);
  };

  const handleHistoryChange = (spine, part, keepForwardHistory) => {
    if (keepForwardHistory) {
      setForceFocus({ type: "partProgress" });
    }
    const newHistoryEntryIsNotDuplicateOfPrevious =
      history[historyIndex]?.spine !== spine ||
      history[historyIndex]?.part !== part;
    if (
      keepForwardHistory !== true &&
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

  const setProgressHelper = (spine, part, keepForwardHistory) => {
    console.log(spine, part);
    epubObject.progress.spine = spine;
    epubObject.progress.part = part;
    prepareSpineIndex(spine);
    setForceFocus(null);
    setProgress({ spine, part });
    handleHistoryChange(spine, part, keepForwardHistory);
    clearTimeout(timeOutToSetProgress.current);
    timeOutToSetProgress.current = setTimeout(() => {
      updateEpubDataInDotNotation({
        key: epubObject.key,
        progress: { spine, part },
      });
    }, 500);
  };

  const spine = epubObject.spine;
  const [preparedSpineIndexes, setPreparedSpineIndexes] = React.useState([]);
  const imageObjectURLs = React.useRef(new Map());

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

  const [autoHide, setAutoHide] = React.useState(false);

  React.useEffect(() => {
    prepareSpineIndex(progress.spine);
    getStateValue("epubHeaderAutoHide").then((autoHide) => {
      setAutoHide(autoHide);
      getStateValue("epubView").then(setView);
    });
    return () => {
      imageObjectURLs.current.keys().forEach(URL.revokeObjectURL);
    };
  }, []);

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
    >
      {view && (
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
            view={view}
            setView={setView}
            formatting={formatting}
            setFormatting={setFormatting}
            history={history}
            historyIndex={historyIndex}
            setHistoryIndex={setHistoryIndex}
            setProgress={setProgressHelper}
            setLoadedCSS={setLoadedCSS}
            setFormatMenuIsOpen={setFormatMenuIsOpen}
            setForceFocus={setForceFocus}
            autoHide={autoHide}
            setAutoHide={setAutoHide}
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
                view={view}
                formatMenuIsOpen={formatMenuIsOpen}
                autoHide={autoHide}
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
                <CircularProgress />
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Dialog>
  );
};

EpubReaderV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  setOpenEpubReader: PropTypes.func.isRequired,
};
