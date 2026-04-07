import React from "react";
import PropTypes from "prop-types";
import { IconButton, Stack, Typography } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export const DefinitionCard = ({ entry }) => {
  const [shortDefinitionIndex, setShortDefinitionIndex] = React.useState(0);
  const onFirstResult = shortDefinitionIndex === 0;
  const onLastResult =
    shortDefinitionIndex >= entry.shortDefinitions.length - 1;

  const handleIteratePrevious = () => {
    setShortDefinitionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleIterateNext = () => {
    setShortDefinitionIndex((prev) => (onLastResult ? prev : prev + 1));
  };

  return (
    <Stack>
      <Stack direction={"row"} spacing={1}>
        <Typography>{entry.term}</Typography>
        <Typography color="gray">{entry.id}</Typography>
      </Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography>{entry.pronunciation}</Typography>
        {entry.offensive && <Typography color="error">Offensive</Typography>}
        <Typography>{entry.functionalLabel}</Typography>
      </Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <IconButton
          size="small"
          disabled={onFirstResult}
          onClick={handleIteratePrevious}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <Stack direction={"row"} alignItems={"center"} spacing={1}>
          <Typography variant="subtitle1">
            {shortDefinitionIndex + 1}
          </Typography>
          <Typography variant="subtitle1">/</Typography>
          <Typography variant="subtitle1">
            {entry.shortDefinitions.length}
          </Typography>
        </Stack>
        <IconButton
          size="small"
          disabled={onLastResult}
          onClick={handleIterateNext}
        >
          <NavigateNextIcon />
        </IconButton>
      </Stack>
      <Typography>{entry.shortDefinitions[shortDefinitionIndex]}</Typography>
      {entry.dateFormatted && (
        <Typography color="gray">
          {"First known use: "}
          {entry.dateFormatted}
        </Typography>
      )}
    </Stack>
  );
};

DefinitionCard.propTypes = {
  entry: PropTypes.object.isRequired,
};
