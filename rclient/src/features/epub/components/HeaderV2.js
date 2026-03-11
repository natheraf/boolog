import * as React from "react";
import {
  AppBar,
  IconButton,
  Slide,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { EpubFormatterV2 } from "./EpubFormatterV2";
import { HistoryButtons } from "./HistoryButtons";
import { SearchV2 } from "./SearchV2";
import { TableOfContents } from "./TableOfContents";

export const appBarHeight = 48;

export const HeaderV2 = ({
  epubObject,
  spineIndex,
  handleClose,
  view,
  setView,
  formatting,
  setFormatting,
  history,
  historyIndex,
  setHistoryIndex,
  setProgress,
  setLoadedCSS,
  setFormatMenuIsOpen,
  setForceFocus,
  autoHide,
  setAutoHide,
}) => {
  const { title, subtitle } = {};
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const [show, setShow] = React.useState(true);
  const showRef = React.useRef(false);
  const showTimeoutId = React.useRef(null);
  const mouseDown = React.useRef(false);

  const handleSetShow = (value) => {
    setShow(value);
    showRef.current = value;
  };

  const onMouseMove = (event) => {
    const keepShowHeight = appBarHeight * 3;
    const showAtY = 5;
    if (!showRef.current && event.clientY <= showAtY && !mouseDown.current) {
      clearTimeout(showTimeoutId.current);
      handleSetShow(true);
    } else if (showRef.current && event.clientY > keepShowHeight) {
      handleSetShow(false);
    } else if (
      showRef.current &&
      event.clientY <= keepShowHeight &&
      event.clientY > showAtY
    ) {
      clearTimeout(showTimeoutId.current);
      showTimeoutId.current = setTimeout(() => {
        handleSetShow(false);
      }, 2000);
    }
  };

  const handleTouchEnd = (event) => {
    if (event.changedTouches.length > 1) {
      return;
    }
    const keepShowHeight = appBarHeight * 3;
    const selectionCollapsed = window.getSelection()?.isCollapsed;
    const touchY = event.changedTouches[0].clientY;
    if (showRef.current && touchY > keepShowHeight) {
      handleSetShow(false);
    } else if (
      !showRef.current &&
      selectionCollapsed &&
      touchY <= keepShowHeight
    ) {
      handleSetShow(true);
    }
  };

  const onMouseDown = () => {
    mouseDown.current = true;
  };

  const onMouseUp = () => {
    mouseDown.current = false;
  };

  React.useEffect(() => {
    const epubBody = document.getElementById("epub-body");
    if (autoHide) {
      epubBody.addEventListener("mousemove", onMouseMove);
      epubBody.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousedown", onMouseDown);
      handleSetShow(false);
    }
    return () => {
      epubBody.removeEventListener("mousemove", onMouseMove);
      epubBody.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [autoHide]);

  return (
    <Slide direction="down" in={show}>
      <AppBar
        id="appBar"
        variant="outlined"
        elevation={0}
        sx={{
          position: autoHide ? "fixed" : "static",
          top: 0,
          width: "100%",
        }}
      >
        <Toolbar
          component={Stack}
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
          spacing={2}
          sx={{ minHeight: `${appBarHeight}px`, height: `${appBarHeight}px` }}
          variant="dense"
        >
          <Stack
            alignItems={"center"}
            direction="row"
            spacing={1}
            sx={{ overflow: "hidden" }}
          >
            <Tooltip title="Close (esc)">
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            {greaterThanSmall ? (
              <Stack spacing={-0.5}>
                <Typography variant="subtitle2" noWrap>
                  {title ?? "Untitled"}
                </Typography>
                {subtitle && (
                  <Typography variant="subtitle1" noWrap>
                    {subtitle}
                  </Typography>
                )}
              </Stack>
            ) : null}
          </Stack>
          <Stack spacing={1} direction={"row"}>
            <HistoryButtons
              epubObject={epubObject}
              history={history}
              historyIndex={historyIndex}
              setHistoryIndex={setHistoryIndex}
              setProgress={setProgress}
            />
            <SearchV2
              epubObject={epubObject}
              currentSpineIndex={spineIndex}
              goToAndPreloadImages={setProgress}
              setForceFocus={setForceFocus}
            />
            <TableOfContents
              epubObject={epubObject}
              spineIndex={spineIndex}
              setProgress={setProgress}
              setForceFocus={setProgress}
            />
            {/* <AnnotationViewer
            spine={spine.current}
            entryId={entryId}
            clearTemporaryMarks={annotatorProps.clearTemporaryMarks}
            notes={notes.current}
            memos={epubObject.memos}
            currentSpineIndex={spinePointer}
            goToNote={annotatorProps.goToNote}
          /> */}
            <EpubFormatterV2
              epubObject={epubObject}
              formatting={formatting}
              setFormatting={setFormatting}
              view={view}
              setView={setView}
              setLoadedCSS={setLoadedCSS}
              setFormatMenuIsOpen={setFormatMenuIsOpen}
            />
          </Stack>
        </Toolbar>
      </AppBar>
    </Slide>
  );
};

HeaderV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  handleClose: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
  history: PropTypes.array.isRequired,
  historyIndex: PropTypes.number.isRequired,
  setHistoryIndex: PropTypes.func.isRequired,
  setProgress: PropTypes.func.isRequired,
  setLoadedCSS: PropTypes.func.isRequired,
  setFormatMenuIsOpen: PropTypes.func.isRequired,
  setForceFocus: PropTypes.func.isRequired,
  autoHide: PropTypes.bool.isRequired,
  setAutoHide: PropTypes.func.isRequired,
};
