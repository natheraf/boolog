import React from "react";
import PropTypes from "prop-types";
import {
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { AnnotatorHeader } from "./AnnotatorHeader";
import { HtmlTooltip } from "../../CustomComponents";
import { merriamWebsterDictionaryLookup } from "../../../api/DictionaryAPI";
import { DefinitionCard } from "./DefinitionCard";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getDataFromMWEntry } from "../../dictionary/MWParser";
import AssistantIcon from "@mui/icons-material/Assistant";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { AnnotatorDictionaryAI } from "./AnnotatorDictionaryAI";

export const AnnotatorDictionary = ({ selectedText }) => {
  const [lookupResults, setLookupResults] = React.useState(null);
  const [lookupResultsIndex, setLookupResultsIndex] = React.useState(0);
  const [useAIDictionary, setUseAIDictionary] = React.useState(false);
  const [loadingAIDefinition, setLoadingAIDefinition] = React.useState(false);
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

  const toggleAI = () => {
    setUseAIDictionary((prev) => !prev);
  };

  React.useEffect(() => {
    merriamWebsterDictionaryLookup(selectedText)
      .then((res) => {
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
    lookupResults && lookupResults.length > 0 && !useAIDictionary ? (
      <Stack>
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
      <AnnotatorDictionaryAI
        selectedText={selectedText}
        hasDictionaryResults={lookupResults?.length === 0}
        loadingAIDefinition={loadingAIDefinition}
        setLoadingAIDefinition={setLoadingAIDefinition}
      />
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
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <HtmlTooltip
            title={
              <Stack>
                <Typography variant="subtitle2">{selectedText}</Typography>
              </Stack>
            }
            placement="top"
            enterDelay={200}
            enterNextDelay={200}
          >
            <Typography variant="h6" noWrap>
              {selectedText}
            </Typography>
          </HtmlTooltip>
          <IconButton
            disabled={loadingAIDefinition && !useAIDictionary}
            onClick={toggleAI}
            size="small"
          >
            {useAIDictionary ? (
              <Tooltip title="Use Dictionary">
                <MenuBookIcon fontSize="small" />
              </Tooltip>
            ) : (
              <Tooltip title="Ask AI">
                {loadingAIDefinition ? (
                  <CircularProgress sx={{ color: "gray" }} size={20} />
                ) : (
                  <AssistantIcon fontSize="small" />
                )}
              </Tooltip>
            )}
          </IconButton>
        </Stack>
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
