import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import CloseIcon from "@mui/icons-material/Close";
import { EpubFormattingPresetsWithPreviews } from "./EpubFormattingPresetsWithPreviews";
import {
  putFormattingStyleElement,
  putHighlightStyles,
  getFormattingWithPreset,
} from "../formattingUtils";
import { EpubFormatEditor } from "./EpubFormatEditor";
import { putEpubData } from "../../../api/IndexedDB/epubData";
import { DynamicMenuAndDialog } from "../../CustomComponents";

/**
 * ReaderFormat Rewritten
 * @param {*} param0
 */
export const EpubFormatterV2 = ({
  epubObject,
  formatting,
  setFormatting,
  view,
  setLoadedCSS,
  setFormatMenuIsOpen,
  clearHeaderHideTimeoutId,
}) => {
  const theme = useTheme();
  const stylingElementIds = React.useRef([]);
  const timeoutToUpdateWindowSize = React.useRef(null);

  const highlightBorderSafety = 25;
  const updateWindowSize = () => {
    clearTimeout(timeoutToUpdateWindowSize.current);
    timeoutToUpdateWindowSize.current = setTimeout(() => {
      if (window.innerWidth - highlightBorderSafety < formatting.pageWidth) {
        const newPageWidth = window.innerWidth - highlightBorderSafety;
        setFormatting((prev) => ({
          ...prev,
          pageWidth: newPageWidth,
        }));
      }
    }, 500);
  };

  const clearEpubStyles = () => {
    stylingElementIds.current.forEach((id) =>
      document.getElementById(id)?.remove()
    );
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openFormatting = Boolean(anchorEl);

  const handleOpenFormatting = (event) => {
    clearHeaderHideTimeoutId();
    setAnchorEl(event.currentTarget);
    setFormatMenuIsOpen(true);
  };
  const handleCloseFormatting = () => {
    setAnchorEl(null);
    setFormatMenuIsOpen(false);
  };

  const setFormattingHelper = (newFormatting) => {
    setFormatting(newFormatting);
    putEpubData(
      { key: "epubGlobalFormatting", formatting: newFormatting },
      true
    );
    const id = putFormattingStyleElement(theme, newFormatting);
    if (!stylingElementIds.current.includes(id)) {
      stylingElementIds.current.push(id);
    }
  };

  React.useEffect(() => {
    const styleId = putHighlightStyles(
      formatting.pageColor,
      formatting.textColor
    );
    if (!stylingElementIds.current.includes(styleId)) {
      stylingElementIds.current.push(styleId);
    }
  }, [formatting]);

  React.useEffect(() => {
    for (const [key, value] of Object.entries(epubObject.css)) {
      const styleElement = document.createElement("style");
      styleElement.id = `epub-css-${key}`;
      styleElement.innerHTML = `#content *, .content * {\n${value}\n}`;
      document.head.insertAdjacentElement("beforeend", styleElement);
      stylingElementIds.current.push(styleElement.id);
    }
    const formattingWithPreset = getFormattingWithPreset(formatting);
    setFormattingHelper(formattingWithPreset);
    setLoadedCSS(true);
    window.addEventListener("resize", updateWindowSize);
    return () => {
      clearEpubStyles();
      window.removeEventListener("resize", updateWindowSize);
    };
  }, []);

  return (
    <Box>
      <Tooltip title="Format">
        <IconButton onClick={handleOpenFormatting}>
          <TextFormatIcon />
        </IconButton>
      </Tooltip>
      <DynamicMenuAndDialog
        anchorEl={anchorEl}
        open={openFormatting}
        onClose={handleCloseFormatting}
        disableRestoreFocus={true}
      >
        <Stack spacing={2} sx={{ padding: 2, maxWidth: "400px" }}>
          <Paper
            elevation={0}
            sx={{
              position: "sticky",
              top: 10,
              padding: 1,
              zIndex: 1,
            }}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{ width: "100%" }}
            >
              <Typography noWrap variant="h5">
                {"Formatting"}
              </Typography>
              <Tooltip title={"Close (esc)"}>
                <IconButton onClick={handleCloseFormatting} size="small">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
          <Stack spacing={2} alignItems={"center"}>
            <EpubFormattingPresetsWithPreviews
              formatting={formatting}
              setFormatting={setFormattingHelper}
            />
            <Divider flexItem />
            <EpubFormatEditor
              formatting={formatting}
              setFormatting={setFormattingHelper}
              view={view}
            />
          </Stack>
        </Stack>
      </DynamicMenuAndDialog>
    </Box>
  );
};

EpubFormatterV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  setLoadedCSS: PropTypes.func.isRequired,
  setFormatMenuIsOpen: PropTypes.func.isRequired,
  clearHeaderHideTimeoutId: PropTypes.func.isRequired,
};
