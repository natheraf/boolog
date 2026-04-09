import React from "react";
import PropTypes from "prop-types";
import { IconButton, Stack, Typography } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

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

  const readWord = () => {
    if (entry.hasOwnProperty("audio")) {
      new Audio(entry.audio).play();
    }
  };

  return (
    <Stack sx={{ maxHeight: "200px" }}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack
          sx={{ maxWidth: 240, overflow: "none" }}
          direction={"row"}
          spacing={1}
        >
          <Typography>{entry.term}</Typography>
          <Typography noWrap color="gray">
            {entry.idNum}
          </Typography>
        </Stack>
        <Typography>{entry.functionalLabel}</Typography>
      </Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography>
          {entry.pronunciation ? `/${entry.pronunciation}/` : ""}
        </Typography>
        {entry.offensive && <Typography color="error">Offensive</Typography>}
        {entry?.audio && (
          <IconButton onClick={readWord} size="small">
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <IconButton
          size="small"
          disabled={onFirstResult}
          onClick={handleIteratePrevious}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <Stack
          sx={{ userSelect: "none" }}
          direction={"row"}
          alignItems={"center"}
          spacing={1}
        >
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
      <Typography sx={{ overflow: "auto", scrollbarWidth: "thin" }}>
        {entry.shortDefinitions[shortDefinitionIndex]}
      </Typography>
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
