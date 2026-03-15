import * as React from "react";
import PropTypes from "prop-types";
import { Divider, Stack, Typography } from "@mui/material";
import { HtmlTooltip } from "../../CustomComponents";
import { Textarea } from "../../../components/Textarea";
import { AnnotatorHeader } from "./AnnotatorHeader";

export const AnnotatorMemos = ({ selectedText }) => {
  const [memo, setMemo] = React.useState("");

  const handleClear = () => {
    setMemo("");
  };

  const handleTextAreaOnChange = (event) => {
    setMemo(event?.target?.value ?? "");
  };

  React.useEffect(() => {
    const textArea = document.getElementById("annotator-text-area");
    textArea.focus();
  }, []);

  return (
    <Stack
      id="annotator-body"
      sx={{
        width: "100%",
        padding: 1,
      }}
      spacing={1}
    >
      <AnnotatorHeader
        selectedText={selectedText}
        canClear
        handleClear={handleClear}
        tab={"memos"}
      />
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
    </Stack>
  );
};

AnnotatorMemos.propTypes = { selectedText: PropTypes.string.isRequired };
