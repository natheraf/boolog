import * as React from "react";
import { Box, CircularProgress, Dialog, Stack } from "@mui/material";
import { HeaderV2 } from "./HeaderV2";
import { DialogSlideUpTransition } from "../../CustomComponents";
import PropTypes from "prop-types";
import { updateEpubDataInDotNotation } from "../../../api/IndexedDB/epubData";
import { ViewRenderer } from "./ContentRenderer";
import { getEpubValueFromPath } from "../epubUtils";
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
    loadImages(spine);
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
  const [visitedSpineIndex, setVisitedSpineIndex] = React.useState([]);
  const imageObjectURLs = React.useRef(new Map());

  const loadImages = (spineIndex) => {
    if (visitedSpineIndex.includes(spineIndex)) return;
    const parser = new DOMParser();
    const page = parser.parseFromString(spine[spineIndex].element, "text/html");
    const imageElements = page.querySelectorAll("img, image");
    const images = epubObject.images;
    for (const element of imageElements) {
      const tag = element.tagName.toLowerCase();
      let url;
      if (tag === "img") {
        const src = element
          .getAttribute("ogsrc")
          ?.substring(element.getAttribute("ogsrc").startsWith("../") * 3);
        url =
          imageObjectURLs.current.get(src) ??
          URL.createObjectURL(getEpubValueFromPath(images, src));
        element.src = url;
        imageObjectURLs.current.set(src, url);
        if (["DIV", "SECTION"].includes(element.parentElement.tagName)) {
          element.style.display = "block";
        }
        element.style.objectFit = "scale-down";
        element.style.margin = "auto";
        element.style.maxHeight = `${formatting.pageHeight}px`;
        element.style.maxWidth = "100%";
      } else if (tag === "image") {
        let src = null;
        for (const key of ["xlink:href", "oghref", "ogsrc"]) {
          if (element.getAttribute(key) !== null) {
            src = element.getAttribute(key);
          }
        }
        src = src?.substring(src.startsWith("../") * 3);
        url =
          imageObjectURLs.current.get(src) ??
          URL.createObjectURL(getEpubValueFromPath(images, src));
        imageObjectURLs.current.set(src, url);
        element.setAttribute("href", url);
        element.style.height = "100%";
        element.style.width = "";
      }
    }
    spine[spineIndex].element = page.documentElement.outerHTML;
    setVisitedSpineIndex((prev) =>
      prev.includes(spineIndex) ? prev : [...prev, spineIndex]
    );
  };

  React.useEffect(() => {
    loadImages(progress.spine);
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
          {visitedSpineIndex.includes(progress.spine) ? (
            <ViewRenderer
              epubObject={epubObject}
              spineIndex={progress.spine}
              partProgress={progress.part}
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
