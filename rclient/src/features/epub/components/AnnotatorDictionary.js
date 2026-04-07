import React from "react";
import PropTypes from "prop-types";
import {
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { AnnotatorHeader } from "./AnnotatorHeader";
import { HtmlTooltip } from "../../CustomComponents";
import { merriamWebsterDictionaryLookup } from "../../../api/DictionaryAPI";
import { DefinitionCard } from "./DefinitionCard";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export const AnnotatorDictionary = ({ selectedText }) => {
  const [lookupResults, setLookupResults] = React.useState(null);
  const [lookupResultsIndex, setLookupResultsIndex] = React.useState(0);
  const onFirstResult = lookupResultsIndex === 0;
  const onLastResult = lookupResultsIndex === lookupResults?.length - 1;

  const handleIteratePrevious = () => {
    if (onFirstResult) {
      return;
    }
    setLookupResultsIndex((prev) => prev - 1);
  };

  const handleIterateNext = () => {
    if (onLastResult) {
      return;
    }
    setLookupResultsIndex((prev) => prev + 1);
  };

  const getDataFromMWEntry = (entry) => {
    const dataMap = {
      id: entry?.meta?.id,
      term: entry?.meta?.id?.includes(":")
        ? entry?.meta?.id?.substring(0, entry?.meta?.id?.indexOf(":"))
        : entry?.meta?.id,
      offensive: entry?.meta?.offensive,
      pronunciation: entry?.hwi?.prs?.[0]?.mw,
      audio: entry?.hwi?.prs?.[0]?.sound?.audio,
      functionalLabel: entry?.fl,
      shortDefinitions: entry?.shortdef,
      date: entry?.date,
      dateFormatted: entry?.date?.includes("{")
        ? entry?.date?.substring(0, entry.date.indexOf("{"))
        : entry?.date,
    };
    dataMap.shortDefinitions ??= [];
    return dataMap;
  };

  React.useEffect(() => {
    merriamWebsterDictionaryLookup(selectedText)
      .then((res) => {
        console.log(res);
        setLookupResults(
          res.lookupResult.filter(
            (result) =>
              typeof result === "object" && result.hasOwnProperty("fl")
          )
        );
      })
      .catch(console.error);
  }, []);

  const searchResults =
    lookupResults && lookupResults?.length > 0 ? (
      <Stack>
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
              {lookupResultsIndex + 1}
            </Typography>
            <Typography variant="subtitle1">/</Typography>
            <Typography variant="subtitle1">{lookupResults.length}</Typography>
          </Stack>
          <IconButton
            size="small"
            disabled={onLastResult}
            onClick={handleIterateNext}
          >
            <NavigateNextIcon />
          </IconButton>
        </Stack>
        <DefinitionCard
          key={getDataFromMWEntry(lookupResults[lookupResultsIndex]).id}
          entry={getDataFromMWEntry(lookupResults[lookupResultsIndex])}
        />
      </Stack>
    ) : (
      <Typography variant="h6" alignSelf={"center"}>
        No Dictionary Results
      </Typography>
    );

  return (
    <Stack
      id="annotator-body"
      sx={{
        width: "100%",
        padding: 1,
      }}
      spacing={1}
    >
      <AnnotatorHeader
        selectedText={selectedText}
        canClear={false}
        handleClear={() => {}}
        tab={"dictionary"}
      />
      <Divider />
      <Stack>
        <HtmlTooltip
          title={
            <Stack>
              <Typography variant="subtitle2">{selectedText}</Typography>
            </Stack>
          }
          placement="right"
          enterDelay={200}
          enterNextDelay={200}
        >
          <Typography variant="h6" noWrap>
            {selectedText}
          </Typography>
        </HtmlTooltip>
        {lookupResults === null ? (
          <LinearProgress sx={{ marginTop: 1 }} />
        ) : (
          searchResults
        )}
      </Stack>
    </Stack>
  );
};

AnnotatorDictionary.propTypes = {
  selectedText: PropTypes.string,
};
