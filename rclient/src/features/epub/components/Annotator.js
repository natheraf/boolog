import * as React from "react";
import {
  Divider,
  Menu,
  Stack,
  styled,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import NotesIcon from "@mui/icons-material/Notes";
import { Textarea } from "../../../components/Textarea";
import { tooltipClasses } from "@mui/material/Tooltip";
import { updatePreference } from "../../../api/IndexedDB/userPreferences";

const SmallTabs = styled(Tabs)(({ tabpanelheight }) => ({
  height: tabpanelheight,
  minHeight: tabpanelheight,
  ".MuiTabs-indicator": {
    borderRadius: "5px",
  },
}));
const SmallTab = styled(Tab)(({ tabpanelheight }) => ({
  height: tabpanelheight,
  minHeight: tabpanelheight,
  borderRadius: "5px",
}));
const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
  },
}));

export const Annotator = ({ entryId, memos, notes }) => {
  const annotatorHeight = 200;
  const annotatorWidth = 300;
  const tabPanelHeight = 30;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectionParentRect, setSelectionParentRect] = React.useState(null);
  const [selectionRect, setSelectionRect] = React.useState(null);
  const [selectedText, setSelectedText] = React.useState(null);
  const openAnnotator = Boolean(anchorEl);
  const annotatorOpen = React.useRef(false);

  const [currentTabValue, setCurrentTabValue] = React.useState(0);
  const tabValueMap = ["memo", "note"];

  const [memo, setMemo] = React.useState("");
  const [note, setNote] = React.useState("");

  const handleOnChangeTab = (event, value) => {
    setCurrentTabValue(value);
  };

  const handleGetTextSelection = () => {
    const selectedString = window.getSelection()?.toString()?.trim();
    if (annotatorOpen.current === false && selectedString?.length > 0) {
      setSelectionParentRect(
        window.getSelection().anchorNode.parentElement.getBoundingClientRect()
      );
      setSelectionRect(
        window.getSelection().getRangeAt(0).getBoundingClientRect()
      );
      setSelectedText(selectedString);
      setAnchorEl(window.getSelection().anchorNode.parentElement);
      annotatorOpen.current = true;
      setMemo(memos[selectedString] ?? "");
    }
  };

  const handleCloseAnnotator = () => {
    setAnchorEl(null);
    annotatorOpen.current = false;
    const updateDB = (memos[selectedText] ?? "") !== memo;
    if (memo.length > 0) {
      memos[selectedText] = memo;
    } else {
      delete memos[selectedText];
    }
    if (updateDB) {
      updatePreference({ key: entryId, memos });
    }
  };

  const handleTextAreaOnChange = (event) => {
    if (tabValueMap[currentTabValue] === "memo") {
      setMemo(event?.target?.value ?? "");
    }
  };

  React.useEffect(() => {
    document
      .getElementById("content")
      .addEventListener("mouseup", handleGetTextSelection);
    return () =>
      document
        .getElementById("content")
        .removeEventListener("mouseup", handleGetTextSelection);
  }, []);

  return (
    <Menu
      anchorEl={anchorEl}
      open={openAnnotator}
      onClose={handleCloseAnnotator}
      anchorOrigin={{
        vertical:
          selectionParentRect && selectionRect
            ? selectionRect.bottom -
              selectionParentRect.top -
              selectionRect.height / 2 -
              20
            : -10,
        horizontal:
          selectionParentRect && selectionRect
            ? selectionRect.right -
              selectionParentRect.left -
              selectionRect.width / 2
            : "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Stack
        sx={{
          width: `${annotatorWidth}px`,
          padding: 1,
        }}
        spacing={1}
      >
        <Typography variant="h6" noWrap>
          {selectedText}
        </Typography>
        <Divider />
        <SmallTabs
          variant="fullWidth"
          value={currentTabValue}
          onChange={handleOnChangeTab}
          tabpanelheight={tabPanelHeight}
        >
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
                    "Jot down something to remind yourself of a character, place, or thing. Whenever you highlight this again, this memo will appear"
                  }
                </Typography>
              </Stack>
            }
            enterDelay={500}
            placement="top"
          >
            <SmallTab
              icon={<StickyNote2Icon />}
              iconPosition="end"
              label="Memo"
              tabpanelheight={tabPanelHeight}
            />
          </HtmlTooltip>
          <Tooltip
            title="Notes are added to the current word/phrase"
            enterDelay={500}
            placement="top"
          >
            <SmallTab
              icon={<NotesIcon />}
              iconPosition="end"
              label="Note"
              tabpanelheight={tabPanelHeight}
            />
          </Tooltip>
        </SmallTabs>
        <Textarea
          value={tabValueMap[currentTabValue] === "memo" ? memo : note}
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
    </Menu>
  );
};
