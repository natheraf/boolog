import * as React from "react";
import PropTypes from "prop-types";
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";

export const AnnotationSort = ({ tab, sort, setSort }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const sortType = tab === "notes" ? sort.notes.type : sort.memos.type;
  const sortOptions =
    tab === "notes"
      ? [
          {
            label: "Reading Order",
            value: "reading_order",
          },
          {
            label: "Modified",
            value: "date_modified",
          },
          {
            label: "Created",
            value: "date_created",
          },
        ]
      : [
          {
            label: "Alphabetical",
            value: "alphabetical",
          },
          {
            label: "Modified",
            value: "date_modified",
          },
          {
            label: "Created",
            value: "date_created",
          },
        ];
  const sortDirection =
    tab === "notes" ? sort.notes.direction : sort.memos.direction;
  const directionOptions = [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "des" },
  ];
  const sortGrouped = tab === "notes" ? sort.notes.grouped : false;
  const groupedOptions = [
    { label: "Grouped By Chapters", value: true },
    { label: "Not Grouped", value: false },
  ];

  const handleTypeChange = (_event, newSortType) => {
    if (newSortType === null) {
      return;
    }
    setSort((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], type: newSortType },
    }));
  };
  const handleDirectionChange = (_event, newSortDirection) => {
    if (newSortDirection === null) {
      return;
    }
    setSort((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], direction: newSortDirection },
    }));
  };
  const handleGroupedChange = () => {
    setSort((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], grouped: !sortGrouped },
    }));
  };

  return (
    <Stack
      justifyContent={"center"}
      alignItems={"center"}
      direction={greaterThanSmall ? "row" : "column"}
      sx={{ marginBottom: 1 }}
      spacing={2}
    >
      <ToggleButtonGroup
        exclusive
        value={sortType}
        onChange={handleTypeChange}
        size="small"
      >
        {sortOptions.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ToggleButtonGroup
        exclusive
        value={sortDirection}
        onChange={handleDirectionChange}
        size="small"
      >
        {directionOptions.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {tab === "notes" && (
        <ToggleButton
          value={"grouped"}
          selected={sortGrouped}
          onChange={handleGroupedChange}
          size="small"
        >
          Group By Chapters
        </ToggleButton>
      )}
    </Stack>
  );
};

AnnotationSort.propTypes = {
  tab: PropTypes.string.isRequired,
  sort: PropTypes.object.isRequired,
  setSort: PropTypes.func.isRequired,
};
