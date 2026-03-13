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
import { Textarea } from "../../../components/Textarea";
import CheckIcon from "@mui/icons-material/Check";
import HelpIcon from "@mui/icons-material/Help";

export const AnnotatorMemos = ({ selectedText }) => {
  const [memo, setMemo] = React.useState("");
  const [copySuccess, setCopySuccess] = React.useState(false);
  const copySuccessTimeout = React.useRef(null);
  const [showMemosHelp, setShowMemosHelp] = React.useState(false);

  const handleClear = () => {
    setMemo("");
  };

  const handleTextAreaOnChange = (event) => {
    setMemo(event?.target?.value ?? "");
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

  const handleOnClickMemosHelp = () => {
    setShowMemosHelp((prev) => !prev);
  };

  React.useEffect(() => {
    const textArea = document.getElementById("annotator-text-area");
    textArea.focus();
    const annotatorNodes = document.getElementById("annotator-memos");
    annotatorNodes.addEventListener("keydown", handleOnKeyDown);
    return () => {
      annotatorNodes.removeEventListener("keydown", handleOnKeyDown);
    };
  }, []);

  return (
    <Stack
      id="annotator-memos"
      sx={{
        width: "100%",
        padding: 1,
      }}
      spacing={1}
    >
      <Stack direction={"row"} justifyContent={"space-between"}>
        <HtmlTooltip
          title={
            <Stack spacing={1}>
              <Typography variant="h6">{"Memos"}</Typography>
              <Typography variant="subtitle2">
                {"Memos appear in every occurrence of a word/phrase"}
              </Typography>
              <Divider />
              <Typography>{"Usage"}</Typography>
              <Typography variant="subtitle2">
                {
                  "Jot down something to remind yourself of a character, place, or thing. Whenever you highlight this again, this memo will appear."
                }
              </Typography>
            </Stack>
          }
          open={showMemosHelp}
          placement="top"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5">Memos</Typography>
            <IconButton size="small" onClick={handleOnClickMemosHelp}>
              <HelpIcon fontSize="small" htmlColor={"gray"} />
            </IconButton>
          </Stack>
        </HtmlTooltip>
        <Stack direction={"row"} alignItems={"center"}>
          <Tooltip placement="top" title={"Copy Selected Text (ctrl + c)"}>
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
          {memo.length > 0 ? (
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
      <Divider />
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <HtmlTooltip
          title={<Typography variant="subtitle2">{selectedText}</Typography>}
          placement="right"
          enterDelay={200}
          enterNextDelay={200}
        >
          <Typography variant="h6" noWrap>
            {selectedText}
          </Typography>
        </HtmlTooltip>
      </Stack>
      <Divider />
      <Textarea
        id="annotator-text-area"
        value={memo}
        onChange={handleTextAreaOnChange}
        onKeyDown={(event) => event.stopPropagation()}
        sx={{
          [`&:focus`]: { boxShadow: "inherit", borderColor: `inherit` },
          [`&:hover:focus`]: {
            borderColor: `inherit`,
          },
        }}
        minRows={3}
      />
      {/* {tabValueMap[currentTabValue] === "note" && (
            <SimpleColorPicker
              color={highlightColor}
              handleRadioOnClick={handleHighlightColorClick}
              handleRadioChange={handleHighlightColorChange(false)}
              handleTextFieldChange={handleHighlightColorChange(true)}
            />
          )} */}
    </Stack>
  );
};

AnnotatorMemos.propTypes = {};
