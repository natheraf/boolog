import PropTypes from "prop-types";
import { Paper, Stack, Typography } from "@mui/material";
import { DatesInARow } from "../../CustomComponents";
import { Textarea } from "../../../components/Textarea";

export const AnnotationMemosList = ({ epubObject, memos, setMemos }) => {
  const setMemosHelper = (key, memoKey, value, arrayIndex) => {
    const memo = epubObject.memos[memoKey];
    memo[key] = value;
    memo.dateModified = new Date().toJSON();
    setMemos((prev) =>
      prev.map(([key, entry], index) => {
        const newEntry = { ...entry };
        if (index === arrayIndex) {
          newEntry[key] = value;
        }
        return [key, newEntry];
      })
    );
  };

  const handleMemoTextAreaOnChange = (memoKey, arrayIndex) => (event) => {
    setMemosHelper("memo", memoKey, event.target.value, arrayIndex);
  };

  return memos.length === 0 ? (
    <Typography
      sx={{
        margin: 2,
        justifySelf: "center",
      }}
      variant="h5"
    >
      {"No Memos"}
    </Typography>
  ) : (
    memos.map(([key, entry], arrayIndex) => (
      <Stack
        component={Paper}
        spacing={1}
        sx={{ padding: 1, margin: 1 }}
        key={key}
      >
        <DatesInARow entry={entry} />
        <Typography variant="h6">{key.toUpperCase()}</Typography>
        <Textarea
          value={entry.memo}
          onChange={handleMemoTextAreaOnChange(key, arrayIndex)}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
          sx={{
            [`&:focus`]: {
              boxShadow: "inherit",
              borderColor: `inherit`,
            },
            [`&:hover:focus`]: {
              borderColor: `inherit`,
            },
            width: "100%",
          }}
          minRows={1}
        />
      </Stack>
    ))
  );
};

AnnotationMemosList.propTypes = {
  epubObject: PropTypes.object.isRequired,
  memos: PropTypes.array.isRequired,
  setMemos: PropTypes.func.isRequired,
};
