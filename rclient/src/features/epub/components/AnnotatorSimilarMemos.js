import * as React from "react";
import PropTypes from "prop-types";
import { Stack, tabsClasses, Typography } from "@mui/material";
import { SmallTab, SmallTabs } from "../../CustomComponents";

export const AnnotatorSimilarMemos = ({ epubObject, memoKey }) => {
  const memos = epubObject.memos;
  const similarMemos = Object.values(memos).filter(
    (entry) =>
      entry.memoKey !== memoKey &&
      (entry.memoKey.includes(memoKey) || memoKey.includes(entry.memoKey))
  );
  const [smallTabsIndex, setSmallTabsIndex] = React.useState(0);

  const handleSmallTabsOnChange = (_event, newIndex) => {
    setSmallTabsIndex(newIndex);
  };

  return similarMemos.length > 0 ? (
    <Stack spacing={1}>
      <Typography color="gray" variant="subtitle1">
        Memos with this text
      </Typography>
      <SmallTabs
        tabpanelheight="30px"
        value={smallTabsIndex}
        onChange={handleSmallTabsOnChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          [`& .${tabsClasses.scrollButtons}`]: {
            "&.Mui-disabled": { opacity: 0.3 },
            width: "20px",
          },
        }}
      >
        {similarMemos.map((memo) => (
          <SmallTab
            key={memo.memoKey}
            label={memo.memoKey.toUpperCase()}
            tabpanelheight="30px"
          />
        ))}
      </SmallTabs>
      <Typography
        sx={{
          textWrap: "balance",
          wordBreak: "break-word",
        }}
      >
        {similarMemos[smallTabsIndex].memo}
      </Typography>
    </Stack>
  ) : (
    <Typography color="gray" variant="subtitle1">
      No Similar Memos
    </Typography>
  );
};

AnnotatorSimilarMemos.propTypes = {
  epubObject: PropTypes.object.isRequired,
  memoKey: PropTypes.string.isRequired,
};
