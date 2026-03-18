import * as React from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { SmallTab, SmallTabs } from "../../CustomComponents";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import CloseIcon from "@mui/icons-material/Close";
import { AnnotationSort } from "./AnnotationSort";

export const AnnotationHeader = ({
  tab,
  setTab,
  sort,
  setSort,
  handleCloseAnnotation,
}) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const width = greaterThanSmall
    ? `${Math.floor(window.innerWidth / 2)}px`
    : window.innerWidth - 32; // 16 is the menu margin gap from the window on each side
  const tabOptions = [
    { title: "Notes", icon: BorderColorIcon, value: "notes" },
    { title: "Memos", icon: StickyNote2Icon, value: "memos" },
  ];
  const tabIndexValue = tabOptions.findIndex((option) => option.value === tab);

  const handleOnChangeTab = (event, index) => {
    // if (tabValueMap[value] === "notes") {
    //   scrollToCurrentChapterSubheader();
    // }
    setTab(tabOptions[index].value);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        marginTop: -1,
        p: 1,
        width,
      }}
    >
      <Stack spacing={2}>
        <Stack
          spacing={1}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <SmallTabs
              variant="fullWidth"
              value={tabIndexValue}
              onChange={handleOnChangeTab}
              tabpanelheight={"100%"}
            >
              {tabOptions.map((option) => (
                <SmallTab
                  key={option.value}
                  icon={<option.icon />}
                  iconPosition="end"
                  label={option.title}
                  tabpanelheight={"100%"}
                />
              ))}
            </SmallTabs>
          </Paper>
          <Tooltip title={"Close (esc)"}>
            <IconButton onClick={handleCloseAnnotation} size="small">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <AnnotationSort tab={tab} sort={sort} setSort={setSort} />
      </Stack>
    </AppBar>
  );
};

AnnotationHeader.propTypes = {
  tab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
  sort: PropTypes.object.isRequired,
  setSort: PropTypes.func.isRequired,
  handleCloseAnnotation: PropTypes.func.isRequired,
};
