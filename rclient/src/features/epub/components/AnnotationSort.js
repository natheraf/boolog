import * as React from "react";
import PropTypes from "prop-types";
import { Grid, ToggleButton, ToggleButtonGroup } from "@mui/material";

export const AnnotationSort = ({ tab, sort, setSort }) => {
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
    setSort({
      ...sort,
      [tab]: { ...sort[tab], type: newSortType },
    });
  };
  const handleDirectionChange = (_event, newSortDirection) => {
    if (newSortDirection === null) {
      return;
    }
    setSort({
      ...sort,
      [tab]: { ...sort[tab], direction: newSortDirection },
    });
  };
  const handleGroupedChange = () => {
    setSort({
      ...sort,
      [tab]: { ...sort[tab], grouped: !sortGrouped },
    });
  };

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      direction={"row"}
      sx={{ marginBottom: 1 }}
      gap={2}
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
    </Grid>
  );
};

AnnotationSort.propTypes = {
  tab: PropTypes.string.isRequired,
  sort: PropTypes.object.isRequired,
  setSort: PropTypes.func.isRequired,
};
