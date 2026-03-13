import * as React from "react";
import PropTypes from "prop-types";
import { Divider, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { HtmlTooltip } from "../../CustomComponents";

export const AnnotatorLeftSideBar = ({
  optionTabs,
  currentTabIndex,
  setCurrentTabIndex,
}) => {
  const theme = useTheme();
  const barWidth = 30;

  const selectedColor =
    theme.palette.mode === "light"
      ? theme.palette.secondary.light
      : theme.palette.secondary.dark;
  const unSelectedColor =
    theme.palette.mode === "light"
      ? theme.palette.primary.light
      : theme.palette.primary.dark;

  const handleOnClick = (index) => () => {
    setCurrentTabIndex(index);
  };

  return (
    <Stack
      sx={{
        position: "absolute",
        left: -barWidth,
        height: "100%",
      }}
    >
      {optionTabs.map((option, index) => (
        <HtmlTooltip
          title={option.htmlTooltipTitle}
          key={option.title}
          placement="left"
          enterDelay={300}
          enterNextDelay={300}
        >
          <Stack
            sx={{
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              cursor: "pointer",
              borderBottom: `3px solid pink`,
              backgroundColor:
                currentTabIndex === index ? selectedColor : unSelectedColor,
              width: barWidth,
              height: "100%",
              padding: 1,
            }}
            justifyContent={"center"}
            alignItems={"center"}
            onClick={handleOnClick(index)}
          >
            <option.icon />
          </Stack>
        </HtmlTooltip>
      ))}
    </Stack>
  );
};

AnnotatorLeftSideBar.propTypes = {
  optionTabs: PropTypes.array.isRequired,
  currentTabIndex: PropTypes.number.isRequired,
  setCurrentTabIndex: PropTypes.func.isRequired,
};
