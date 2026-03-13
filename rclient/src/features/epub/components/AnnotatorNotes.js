import * as React from "react";
import PropTypes from "prop-types";
import { Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { HtmlTooltip } from "../../CustomComponents";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Textarea } from "../../../components/Textarea";

export const AnnotatorNotes = ({ selectedText }) => {
  const [note, setNode] = React.useState("");
  const [highlightColor, setHighlightColor] = React.useState(null);

  const handleClear = () => {};

  const handleTextAreaOnChange = () => {};

  return (
    <Stack
      sx={{
        width: "100%",
        padding: 1,
      }}
      spacing={1}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <HtmlTooltip
          title={<Typography variant="subtitle2">{selectedText}</Typography>}
          placement="left"
          enterDelay={100}
          enterNextDelay={100}
        >
          <Typography variant="h6" noWrap>
            {selectedText}
          </Typography>
        </HtmlTooltip>
        <Stack direction={"row"} alignItems={"center"}>
          <Tooltip title={"Copy"}>
            <IconButton
              onClick={() => navigator.clipboard.writeText(selectedText)}
            >
              <CopyAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {note.length > 0 || highlightColor ? (
            <Tooltip title={"Clear"}>
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
      <Textarea
        // ref={textAreaRef}
        value={note}
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

AnnotatorNotes.propTypes = {};
