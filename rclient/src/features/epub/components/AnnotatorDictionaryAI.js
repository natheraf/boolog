import React from "react";
import PropTypes from "prop-types";
import { handleFetchPost } from "../../../api/Axios";
import {
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import AssistantIcon from "@mui/icons-material/Assistant";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export const AnnotatorDictionaryAI = ({
  selectedText,
  hasNoDictionaryResults,
  loadingAIDefinition,
  setLoadingAIDefinition,
  selectedTextContext,
}) => {
  const [err, setErr] = React.useState(false);
  const [aiResponse, setAiResponse] = React.useState(null);
  const [tps, setTps] = React.useState(null);

  const sendMessage = async () => {
    setLoadingAIDefinition(true);
    const response = await handleFetchPost(
      {
        messages: [
          {
            role: "user",
            content: `With the context ${JSON.stringify(selectedTextContext)}. Concisely give a definition with and without context: ${selectedText}.`,
          },
        ],
      },
      "resources/gemma4"
    );
    if (response.error) {
      setErr(true);
      return console.error("API error:", response.error);
    }

    let assistantMessage = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }
        const data = line.replace("data: ", "");
        if (data === "[DONE]") {
          break;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.token) {
            assistantMessage += parsed.token;
            setAiResponse(assistantMessage);
          }
          if (parsed.usage) {
            const usage = parsed.usage;
            setTps({
              generation: usage.completion_tokens / (usage.genMs / 1000),
              prompt: usage.prompt_tokens / (usage.promptMs / 1000),
            });
          }
        } catch (e) {
          // Incomplete SSE chunk, will be completed in next iteration
          buffer = line + "\n\n" + buffer;
        }
      }
    }
    setLoadingAIDefinition(false);
  };

  React.useEffect(() => {
    if (!hasNoDictionaryResults) {
      sendMessage();
    }
  }, []);

  return (
    <Stack spacing={1}>
      {!aiResponse && hasNoDictionaryResults && (
        <Typography color="error" variant="h6" alignSelf={"center"}>
          No Dictionary Results
        </Typography>
      )}
      {!aiResponse && !loadingAIDefinition && hasNoDictionaryResults && (
        <Button
          variant="outlined"
          onClick={sendMessage}
          endIcon={<AutoAwesomeIcon fontSize="small" />}
        >
          Ask AI
        </Button>
      )}
      {loadingAIDefinition && (
        <Stack spacing={2} alignItems={"center"}>
          <Typography variant="h5">Asking AI</Typography>
          <CircularProgress />
        </Stack>
      )}
      {err && (
        <Typography color="error" variant="h6" alignSelf={"center"}>
          Error asking AI
        </Typography>
      )}
      {aiResponse && tps && (
        <Stack
          sx={{ maxHeight: "200px", overflow: "auto", scrollbarWidth: "thin" }}
        >
          {typeof aiResponse === "string" ? (
            <ReactMarkdown>{aiResponse}</ReactMarkdown>
          ) : (
            <Typography>{aiResponse}</Typography>
          )}
          <Tooltip title={"Prompt t/s | Generation t/s"}>
            <Typography
              alignSelf={"end"}
              color="gray"
              variant="subtitle2"
            >{`(${tps.prompt.toFixed(2)}, ${tps.generation.toFixed(2)})`}</Typography>
          </Tooltip>
        </Stack>
      )}
    </Stack>
  );
};

AnnotatorDictionaryAI.propTypes = {
  selectedText: PropTypes.string.isRequired,
  hasNoDictionaryResults: PropTypes.bool.isRequired,
  loadingAIDefinition: PropTypes.bool.isRequired,
  setLoadingAIDefinition: PropTypes.func.isRequired,
  selectedTextContext: PropTypes.object,
};
