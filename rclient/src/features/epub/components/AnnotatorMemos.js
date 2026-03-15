import * as React from "react";
import PropTypes from "prop-types";
import { Divider, Stack, Typography } from "@mui/material";
import { HtmlTooltip } from "../../CustomComponents";
import { Textarea } from "../../../components/Textarea";
import { AnnotatorHeader } from "./AnnotatorHeader";
import { formatMemoKey } from "../formattingUtils";
import { deleteEpubData, putEpubData } from "../../../api/IndexedDB/epubData";
import { getNewId } from "../../../api/IndexedDB/common";

export const AnnotatorMemos = ({ epubObject, selectedText }) => {
  const memos = epubObject.memos;
  const entryId = epubObject.key;
  const memoKey = formatMemoKey(selectedText);
  const [memo, setMemo] = React.useState(memos[memoKey]?.memo ?? "");
  const [canClear, setCanClear] = React.useState(memo.length > 0);

  const setMemoHelper = (value) => {
    setMemo(value);
    if (memos.hasOwnProperty(memoKey) === false) {
      memos[memoKey] = {};
    }
    memos[memoKey].memo = value;
    handleSave();
  };

  const handleClear = () => {
    setMemoHelper("");
  };

  const handleTextAreaOnChange = (event) => {
    setMemoHelper(event?.target?.value ?? "");
  };

  const handleSave = () => {
    const date = new Date().toJSON();
    const memo = memos[memoKey].memo;
    if (memo.length > 0) {
      if (memos[memoKey].hasOwnProperty("dateCreated")) {
        memos[memoKey].dateModified = date;
      } else {
        const memoId = getNewId();
        memos[memoKey] = {
          key: `${entryId}.memos.${memoId}`,
          entryId,
          memo,
          dateCreated: date,
          dateModified: date,
          selectedText: selectedText,
        };
      }
      putEpubData(memos[memoKey]);
      setCanClear(true);
    } else {
      if (memos[memoKey].hasOwnProperty("key")) {
        deleteEpubData(memos[memoKey]);
      }
      delete memos[memoKey];
      setCanClear(false);
    }
  };

  React.useEffect(() => {
    const textArea = document.getElementById("annotator-text-area");
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
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
        canClear={canClear}
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

AnnotatorMemos.propTypes = {
  epubObject: PropTypes.object.isRequired,
  selectedText: PropTypes.string.isRequired,
};
