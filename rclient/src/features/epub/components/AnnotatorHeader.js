import * as React from "react";
import PropTypes from "prop-types";
import {
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { HtmlTooltip } from "../../CustomComponents";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import HelpIcon from "@mui/icons-material/Help";
import CloseIcon from "@mui/icons-material/Close";
import { annotatorHelpHTMLTooltipData } from "../../../api/Local";
import GoogleIcon from "@mui/icons-material/Google";
import SearchIcon from "@mui/icons-material/Search";
import { waitForElement } from "../domUtils";

export const AnnotatorHeader = ({
  selectedText,
  canClear,
  handleClear,
  tab,
}) => {
  const tabNames = { notes: "Notes", memos: "Memos" };
  const [showHelp, setShowHelp] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const copySuccessTimeout = React.useRef(null);

  const handleOnClickHelp = () => {
    setShowHelp((prev) => !prev);
  };

  const handleCopySelectedText = () => {
    setCopySuccess(true);
    navigator.clipboard.writeText(selectedText);
    clearTimeout(copySuccessTimeout.current);
    copySuccessTimeout.current = setTimeout(() => setCopySuccess(false), 1000);
  };

  const handleOnKeyDown = (event) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const notSelectingText =
      window.getSelection()?.toString()?.trim()?.length === 0;
    if (isCtrlOrCmd && event.key === "c" && notSelectingText) {
      handleCopySelectedText();
    }
  };

  const handleOnClickGoogle = () => {
    if (selectedText) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`,
        "_blank"
      );
    }
  };

  const handleSearch = () => {
    const searchButton = document.getElementById("open-search-button");
    searchButton.click();
    waitForElement("#search-text-field").then((textField) => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(textField, selectedText);
      textField.dispatchEvent(new Event("input", { bubbles: true }));
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      textField.dispatchEvent(enterEvent);
    });
  };

  React.useEffect(() => {
    const annotatorNodes = document.getElementById("annotator-body");
    annotatorNodes.addEventListener("keydown", handleOnKeyDown);
    return () => {
      annotatorNodes.removeEventListener("keydown", handleOnKeyDown);
    };
  }, []);

  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <HtmlTooltip
        title={
          <Stack spacing={1}>
            <Stack direction="row" justifyContent={"space-between"}>
              <Typography variant="h6">
                {annotatorHelpHTMLTooltipData[tab].title}
              </Typography>
              <IconButton size="small" onClick={handleOnClickHelp}>
                <CloseIcon htmlColor="gray" />
              </IconButton>
            </Stack>
            <Typography variant="subtitle2">
              {annotatorHelpHTMLTooltipData[tab].titleDescription}
            </Typography>
            <Divider />
            <Typography>
              {annotatorHelpHTMLTooltipData[tab].subtitle}
            </Typography>
            <Typography variant="subtitle2">
              {annotatorHelpHTMLTooltipData[tab].subtitleDescription}
            </Typography>
          </Stack>
        }
        open={showHelp}
        placement="top"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5">{tabNames[tab]}</Typography>
          <IconButton size="small" onClick={handleOnClickHelp}>
            <HelpIcon fontSize="small" htmlColor={"gray"} />
          </IconButton>
        </Stack>
      </HtmlTooltip>
      <Stack direction={"row"} alignItems={"center"}>
        <Tooltip placement="top" title={"Google"}>
          <IconButton onClick={handleOnClickGoogle}>
            <GoogleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={"Search"}>
          <IconButton onClick={handleSearch}>
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={"Copy (ctrl + c)"}>
          <IconButton onClick={handleCopySelectedText}>
            {copySuccess ? (
              <Zoom in={true} timeout={500}>
                <CheckIcon fontSize="small" />
              </Zoom>
            ) : (
              <CopyAllIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        {canClear ? (
          <Tooltip placement="top" title={"Clear"}>
            <IconButton onClick={handleClear}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton disabled>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

AnnotatorHeader.propTypes = {
  selectedText: PropTypes.string.isRequired,
  canClear: PropTypes.bool.isRequired,
  handleClear: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
};
