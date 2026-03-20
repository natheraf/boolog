import * as React from "react";
import PropTypes from "prop-types";
import { Paper, Stack, Typography } from "@mui/material";

export const AnnotatorSimilarMemosList = ({ epubObject, memoKey }) => {
  const memos = epubObject.memos;
  const similarMemos = Object.values(memos)
    .filter(
      (entry) =>
        entry.memoKey !== memoKey &&
        (entry.memoKey.includes(memoKey) || memoKey.includes(entry.memoKey))
    )
    .sort((a, b) => a.memoKey.length - b.memoKey.length);

  return (
    similarMemos.length > 0 && (
      <Stack spacing={1}>
        <Typography color="gray" variant="subtitle1">
          Memos with this text
        </Typography>
        <Stack spacing={2}>
          {similarMemos.map((memo) => (
            <Paper key={memo.memoKey} elevation={0} sx={{ padding: 1 }}>
              <Paper elevation={1}>
                <Typography
                  sx={{
                    textWrap: "balance",
                    wordBreak: "break-word",
                  }}
                  textAlign={"center"}
                  variant="subtitle1"
                >
                  {memo.memoKey.toUpperCase()}
                </Typography>
              </Paper>
              <Typography
                sx={{
                  textWrap: "balance",
                  wordBreak: "break-word",
                }}
              >
                {memo.memo}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Stack>
    )
  );
};

AnnotatorSimilarMemosList.propTypes = {
  epubObject: PropTypes.object.isRequired,
  memoKey: PropTypes.string.isRequired,
};
