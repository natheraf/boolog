import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  CircularProgress,
  Divider,
  Fab,
  IconButton,
  Paper,
  Slide,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import CloseIcon from "@mui/icons-material/Close";
import { Textarea } from "../../components/Textarea";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import { handleFetchPost } from "../../api/Axios";
import RecyclingIcon from "@mui/icons-material/Recycling";
import ReactMarkdown from "react-markdown";

export const Chat = () => {
  const width = Math.max(300, window.innerWidth / 2);
  const height = 500;
  const gemmaStartingText = [
    "Hello! I am Gemma 4.",
    "I am a Large Language Model developed by Google DeepMind. I am an open weights model designed to process and understand information, and I can generate text responses to a wide variety of prompts and questions.",
    "How can I help you today?",
  ];
  const startingMessages = [
    {
      role: "assistant",
      content: gemmaStartingText.join("\n\n"),
    },
  ];
  const [messages, setMessages] = React.useState(startingMessages);
  const [open, setOpen] = React.useState(false);
  const [textareaFocused, setTextareaFocused] = React.useState(false);
  const [textareaValue, setTextareaValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [tps, setTps] = React.useState([null]);

  const textareaOnFocused = () => {
    setTextareaFocused(true);
  };

  const textareaOnBlurred = () => {
    setTextareaFocused(false);
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const sendMessage = async (userInput) => {
    if (!userInput || userInput.length === 0) {
      return;
    }
    textareaOnBlurred();
    setLoading(true);
    setTextareaValue("");
    const newMessages = [...messages, { role: "user", content: userInput }];
    setTps((prev) => [...prev, null]);
    setMessages([
      ...newMessages,
      { role: "assistant", content: <CircularProgress size={30} /> },
    ]);

    const response = await handleFetchPost(
      { messages: newMessages },
      "resources/gemma4"
    );

    let assistantMessage = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split("\n\n").filter(Boolean);

      for (const line of lines) {
        const data = line.replace("data: ", "");
        if (data === "[DONE]") break;
        const parsed = JSON.parse(data);

        if (parsed.token) {
          assistantMessage += parsed.token;
          setMessages([
            ...newMessages,
            { role: "assistant", content: assistantMessage },
          ]);
        }

        if (parsed.usage) {
          const usage = parsed.usage;
          setTps((prev) => [
            ...prev,
            {
              generation: usage.completion_tokens / (usage.genMs / 1000),
              prompt: usage.prompt_tokens / (usage.promptMs / 1000),
            },
          ]);
        }
      }
    }

    setMessages([
      ...newMessages,
      { role: "assistant", content: assistantMessage },
    ]);
    setLoading(false);
  };

  const handleOnKeyDown = (event) => {
    const isShift = event.shiftKey;
    const enterPressed = ["Enter"].includes(event.key);
    if (!isShift && enterPressed) {
      sendMessage(textareaValue);
    }
  };

  const textareaOnChange = (event) => {
    setTextareaValue(event?.target?.value ?? "");
  };

  const reset = () => {
    setMessages(startingMessages);
    setTps([null]);
  };

  React.useEffect(() => {
    const scrollWindow = document.getElementById("gemma-scroll-window");
    if (typeof messages.at(-1).content === "string") {
      return;
    }
    scrollWindow.scrollTop = scrollWindow.scrollHeight;
  }, [messages]);

  return (
    <Stack
      sx={{
        position: "fixed",
        bottom: 25,
        right: 10,
        zIndex: 1,
      }}
      spacing={1}
      alignItems={"end"}
    >
      <Slide in={open} direction="left">
        <Paper
          component={Stack}
          spacing={1}
          elevation={2}
          sx={{ width, height, p: 1, overflow: "auto" }}
        >
          <Stack
            direction={"row"}
            spacing={1}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h6">Gemma 4</Typography>
            <IconButton onClick={reset} size="small">
              <RecyclingIcon />
            </IconButton>
          </Stack>
          <Divider />
          <Paper
            id="gemma-scroll-window"
            component={Stack}
            spacing={1}
            sx={{
              height: "100%",
              p: 1,
              overflow: "auto",
              scrollbarWidth: "thin",
            }}
            elevation={0}
          >
            {messages.map((message, index) => (
              <Stack key={index}>
                <Stack
                  spacing={1}
                  direction={
                    message.role === "assistant" ? "row" : "row-reverse"
                  }
                  alignItems={"end"}
                >
                  {message.role === "assistant" ? null : <PersonIcon />}
                  <Stack
                    sx={{
                      width: message.role === "assistant" ? "100%" : "auto",
                    }}
                  >
                    <Paper
                      elevation={message.role === "assistant" ? 0 : 2}
                      sx={{
                        p: message.role === "assistant" ? 0 : 1,
                      }}
                    >
                      {typeof message.content === "string" ? (
                        <Box
                          sx={{
                            width: "100%",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          }}
                        >
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </Box>
                      ) : (
                        message.content
                      )}
                    </Paper>
                    {tps[index] && (
                      <Tooltip title={"Prompt t/s | Generation t/s"}>
                        <Typography
                          alignSelf={"end"}
                          color="gray"
                          variant="subtitle2"
                        >{`(${tps[index].prompt.toFixed(2)}, ${tps[index].generation.toFixed(2)})`}</Typography>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Paper>
          <Stack direction={"row"} spacing={1}>
            <Textarea
              onKeyDown={handleOnKeyDown}
              onFocus={textareaOnFocused}
              onBlur={textareaOnBlurred}
              onChange={textareaOnChange}
              sx={{ width: "100%" }}
              minRows={1}
              value={textareaValue}
              disabled={loading}
            />
            {textareaFocused ? null : (
              <IconButton
                disabled={textareaValue.length === 0 || loading}
                color="success"
              >
                {loading ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            )}
          </Stack>
        </Paper>
      </Slide>
      <Zoom in={true} direction="up">
        <Tooltip
          title={open ? "Click to Close" : "Talk to Gemma 4"}
          placement={"left"}
        >
          <Fab onClick={toggleOpen} color={"primary"}>
            {open ? <CloseIcon /> : <AssistantIcon />}
          </Fab>
        </Tooltip>
      </Zoom>
    </Stack>
  );
};
