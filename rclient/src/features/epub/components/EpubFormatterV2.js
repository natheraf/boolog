import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { getGoogleFonts } from "../../../api/GoogleAPI";
import {
  Box,
  IconButton,
  Menu,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import CloseIcon from "@mui/icons-material/Close";
import CloudIcon from "@mui/icons-material/Cloud";
import { EpubFormattingPresets } from "./EpubFormattingPresets";
import { getStateValue, setStateValue } from "../../../api/IndexedDB/State";
import {
  putFormattingStyleElement,
  putHighlightStyles,
  getFormattingWithPreset,
} from "../formattingUtils";

/**
 * ReaderFormat Rewritten
 * @param {*} param0
 */
export const EpubFormatterV2 = ({ epubObject, formatting, setFormatting }) => {
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

  const googleFonts = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openFormatting = Boolean(anchorEl);

  const handleOpenFormatting = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseFormatting = (event) => {
    setAnchorEl(null);
  };

  const [epubPreset, setEpubPreset] = React.useState("custom");

  const setFormattingHelper = (newFormatting) => {
    setFormatting(newFormatting);
    const id = putFormattingStyleElement(theme, newFormatting);
    if (!stylingElementIds.current.includes(id)) {
      stylingElementIds.current.push(id);
    }
  };

  React.useEffect(() => {
    getGoogleFonts().then((obj) => {
      googleFonts.current = obj.items;
    });
    getStateValue("epubPreset").then((value) => {
      if (value === undefined) {
        value = theme.palette.mode;
        setStateValue("epubPreset", value);
      }
      setEpubPreset(value);
      const formattingWithPreset = getFormattingWithPreset(value, formatting);
      setFormattingHelper(formattingWithPreset);
    });
    for (const [key, value] of Object.entries(epubObject.css)) {
      const styleElement = document.createElement("style");
      styleElement.id = `epub-css-${key}`;
      styleElement.innerHTML = `#content *, .content * {\n${value}\n}`;
      document.head.insertAdjacentElement("beforeend", styleElement);
      stylingElementIds.current.push(styleElement.id);
    }
    stylingElementIds.current.push(putHighlightStyles());
    window.addEventListener("resize", updateWindowSize);
    return () => {
      clearEpubStyles();
      window.removeEventListener("resize", updateWindowSize);
    };
  }, []);

  return (
    <Box>
      <Tooltip title="Format (f)">
        <IconButton onClick={handleOpenFormatting}>
          <TextFormatIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={openFormatting}
        onClose={handleCloseFormatting}
      >
        <Stack
          spacing={2}
          alignItems={"center"}
          sx={{ width: "300px", padding: 2 }}
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
          <Stack spacing={2} alignItems={"center"}>
            <EpubFormattingPresets
              formatting={formatting}
              setFormatting={setFormattingHelper}
              preset={epubPreset}
              setPreset={setEpubPreset}
            />
          </Stack>
        </Stack>
      </Menu>
    </Box>
  );
};

EpubFormatterV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
};
