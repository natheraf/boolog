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
import { EpubSettings } from "./EpubSettings";
import { AnnotationViewerV2 } from "./AnnotationViewerV2";

export const appBarHeight = 48;

export const HeaderV2 = ({
  epubObject,
  spineIndex,
  handleClose,
  formatting,
  setFormatting,
  displayOptions,
  setDisplayOptions,
  history,
  historyIndex,
  setHistoryIndex,
  setProgress,
  setProgressIsHistoryEntry,
  setProgressWithoutAddingHistory,
  setLoadedCSS,
  setFormatMenuIsOpen,
  setForceFocus,
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
    const keepShow = event.clientY <= keepShowHeight;
    const showAtY = 10;
    const navigatorTabsBuffer = 12;
    const nearNavigatorTabs = !(
      event.clientX > navigatorTabsBuffer &&
      event.clientX < window.innerWidth - navigatorTabsBuffer
    );
    const inYRange = event.clientY <= showAtY;
    if (
      !showRef.current &&
      inYRange &&
      !mouseDown.current &&
      !nearNavigatorTabs
    ) {
      clearTimeout(showTimeoutId.current);
      handleSetShow(true);
    } else if (showRef.current && (!keepShow || nearNavigatorTabs)) {
      handleSetShow(false);
    } else if (showRef.current && keepShow) {
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
    const dialogContainer = document.getElementsByClassName(
      "MuiDialog-container"
    )[0];
    if (displayOptions.autoHideHeader) {
      epubBody.addEventListener("touchend", handleTouchEnd);
      dialogContainer.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousedown", onMouseDown);
    }
    setShow(!displayOptions.autoHideHeader);
    return () => {
      clearTimeout(showTimeoutId.current);
      epubBody.removeEventListener("touchend", handleTouchEnd);
      dialogContainer.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [displayOptions.autoHideHeader]);

  return (
    <Slide direction="down" in={show} mountOnEnter>
      <AppBar
        id="appBar"
        variant="outlined"
        elevation={0}
        sx={{
          position: displayOptions.autoHideHeader ? "fixed" : "static",
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
              setProgress={setProgressIsHistoryEntry}
            />
            <SearchV2
              epubObject={epubObject}
              currentSpineIndex={spineIndex}
              goToAndPreloadImages={setProgressWithoutAddingHistory}
              setForceFocus={setForceFocus}
            />
            <TableOfContents
              epubObject={epubObject}
              spineIndex={spineIndex}
              setProgress={setProgressWithoutAddingHistory}
              setForceFocus={setForceFocus}
            />
            <AnnotationViewerV2
              epubObject={epubObject}
              spineIndex={spineIndex}
            />
            <EpubFormatterV2
              epubObject={epubObject}
              formatting={formatting}
              setFormatting={setFormatting}
              view={displayOptions.view}
              setLoadedCSS={setLoadedCSS}
              setFormatMenuIsOpen={setFormatMenuIsOpen}
            />
            <EpubSettings
              displayOptions={displayOptions}
              setDisplayOptions={setDisplayOptions}
              formatting={formatting}
              setFormatting={setFormatting}
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
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
  displayOptions: PropTypes.object.isRequired,
  setDisplayOptions: PropTypes.func.isRequired,
  history: PropTypes.array.isRequired,
  historyIndex: PropTypes.number.isRequired,
  setHistoryIndex: PropTypes.func.isRequired,
  setProgress: PropTypes.func.isRequired,
  setProgressIsHistoryEntry: PropTypes.func.isRequired,
  setProgressWithoutAddingHistory: PropTypes.func.isRequired,
  setLoadedCSS: PropTypes.func.isRequired,
  setFormatMenuIsOpen: PropTypes.func.isRequired,
  setForceFocus: PropTypes.func.isRequired,
};
