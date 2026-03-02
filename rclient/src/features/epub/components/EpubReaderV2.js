import * as React from "react";
import { Box, CircularProgress, Dialog, Stack } from "@mui/material";
import { HeaderV2 } from "./HeaderV2";
import { DialogSlideUpTransition } from "../../CustomComponents";
import PropTypes from "prop-types";
import { updateEpubDataInDotNotation } from "../../../api/IndexedDB/epubData";
import { ViewRenderer } from "./ViewRenderer";
import { getEpubValueFromPath, loadImages } from "../epubUtils";
import { getStateValue } from "../../../api/IndexedDB/State";
import { waitForElement } from "../domUtils";
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
  const [view, setView] = React.useState(null);
  /**
   * when swapping to scroll at the start of a chapter, continuous scroll will scroll all the way up to the top sentinel. this was a workaround. look: ContinuousScrollView:32
   * @deprecated
   * @param {string} value
   */
  const setViewHelper = (value) => {
    setView(value);
    if (value === "scroll" && progress.part === 0) {
      setForceFocus({ type: "boundary", location: "start" });
    }
  };
  const [forceFocus, setForceFocus] = React.useState(null);

  const highlightBorderSafety = 25;
  const [formatting, setFormatting] = React.useState({
    pagesShown: 1,
    pageWidth: Math.min(700, window.innerWidth - highlightBorderSafety),
    pageHeight: window.innerHeight,
    columnGap: 1,
    backgroundColors: theme.palette.background.default,
    showDividers: true,
    opacityOfSideElements: 0.5,
    showArrows: true,
  });

  console.log(epubObject);
  const handleClose = () => {
    setOpenEpubReader(false);
  };

  const setProgressHelper = (spine, part) => {
    console.log(spine, part);
    epubObject.progress.spine = spine;
    epubObject.progress.part = part;
    prepareSpineIndex(spine);
    setForceFocus(null);
    setProgress({ spine, part });
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

  React.useEffect(() => {
    prepareSpineIndex(progress.spine);
    getStateValue("epubView").then(setView);
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
          handleClose={handleClose}
          view={view}
          setView={setView}
          formatting={formatting}
          setFormatting={setFormatting}
        />
        <Box
          id="epub-body"
          sx={{
            backgroundColor: formatting.backgroundColors,
            flex: "1 1 auto",
            overflowY: "auto",
            width: "100%",
            scrollbarColor: `${theme.palette.text.disabled} ${theme.palette.background.paper}`,
            scrollbarWidth: "thin",
          }}
          tabIndex={0}
        >
          {(progress.spine === 0 ||
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
    </Dialog>
  );
};

EpubReaderV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  setOpenEpubReader: PropTypes.func.isRequired,
};
