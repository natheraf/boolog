import * as React from "react";
import PropTypes from "prop-types";
import { Stack, Tooltip } from "@mui/material";
import { useTheme } from "@emotion/react";

export const AnnotatorLeftSideBar = ({
  tabOptions,
  currentTabIndex,
  setCurrentTabIndex,
  annotatorHeight,
}) => {
  const theme = useTheme();
  const barWidth = 30;

  const selectedColor =
    theme.palette.mode === "light"
      ? theme.palette.secondary.light
      : theme.palette.secondary.dark;
  const unSelectedColor =
    theme.palette.mode === "light" ? "#ffffff99" : "#c7c7c799";

  const handleOnClick = (index) => () => {
    setCurrentTabIndex(index);
  };

  const height = annotatorHeight * 0.95;
  return (
    <Stack sx={{ height }}>
      {tabOptions.map((option, index) => (
        <Tooltip
          title={option.title}
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
        </Tooltip>
      ))}
    </Stack>
  );
};

AnnotatorLeftSideBar.propTypes = {
  tabOptions: PropTypes.array.isRequired,
  currentTabIndex: PropTypes.number.isRequired,
  setCurrentTabIndex: PropTypes.func.isRequired,
  annotatorHeight: PropTypes.number.isRequired,
};
