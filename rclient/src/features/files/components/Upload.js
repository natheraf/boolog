import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";

import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import BookIcon from "@mui/icons-material/Book";
import AdsClickIcon from "@mui/icons-material/AdsClick";

const LinearProgressWithLabel = (props) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {`${Math.round(props.valueBuffer)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export const Upload = ({ file, setFile, originalFile }) => {
  const theme = useTheme();
  const inputFile = React.useRef(null);
  const [storageEstimate, setStorageEstimate] = React.useState({
    usage: 0,
    quota: 0,
  });
  const [originalFileSize, setOriginalFileSize] = React.useState(0);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileClear = () => {
    setFile(null);
    inputFile.current.value = null;
  };

  const handleOnClick = () => {
    inputFile.current.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (
      event.dataTransfer.items &&
      event.dataTransfer.items.length > 0 &&
      event.dataTransfer.items[0].kind === "file"
    ) {
      const file = event.dataTransfer.items[0].getAsFile();
      setFile(file);
    } else if (
      event.dataTransfer.files &&
      event.dataTransfer.files.length > 0
    ) {
      const file = event.dataTransfer.files[0];
      setFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const updateStorageEstimate = () => {
    navigator.storage.estimate().then((res) => setStorageEstimate(res));
  };

  const scaleStorageUnites = (bytes) => {
    const scale = ["B", "KB", "MB", "GB", "TB"];
    let pow = scale.length - 1;
    while (pow > 0 && bytes / Math.pow(1024, pow) < 1) {
      pow -= 1;
    }
    return `${(bytes / Math.pow(1024, pow)).toFixed(2)} ${scale[pow]}`;
  };

  React.useEffect(() => {
    updateStorageEstimate();
    setOriginalFileSize(originalFile?.size ?? 0);
    const uploadBox = document.getElementById("uploadBox");
    const onDragEnter = (event) => {
      event.preventDefault();
      setDragOver(true);
    };
    const onDragLeave = (event) => {
      event.preventDefault();
      setDragOver(false);
    };
    uploadBox.addEventListener("dragenter", onDragEnter);
    uploadBox.addEventListener("dragleave", onDragLeave);

    return () => {
      uploadBox.removeEventListener("dragenter", onDragEnter);
      uploadBox.removeEventListener("dragleave", onDragLeave);
    };
  }, []);

  return (
    <Stack
      id="uploadBox"
      sx={{
        border: dragOver ? "2px dashed white" : "1px solid gray",
        borderRadius: "3px",
        padding: "10px",
        width: "100%",
        overflow: "hidden",
        cursor: file ? null : "pointer",
        "&:hover": file
          ? null
          : {
              borderColor: "white",
            },
      }}
      alignItems={"center"}
      justifyItems={"center"}
      spacing={1}
      color={theme.palette.text.secondary}
      onClick={file ? null : handleOnClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent={"center"}
        spacing={1}
      >
        {file ? null : <DownloadIcon />}
        <Typography>{file?.name ?? "Drag a File / Click to Browse"}</Typography>
        {file ? <BookIcon /> : <AdsClickIcon />}
      </Stack>
      {file !== null ? (
        <Stack spacing={1} alignItems={"center"} justifyItems={"center"}>
          <Typography>{scaleStorageUnites(file?.size)}</Typography>
          <Button
            variant="text"
            color="error"
            component="label"
            onClick={handleFileClear}
            size="small"
          >
            {"Clear"}
          </Button>
        </Stack>
      ) : null}
      <Typography>
        {`Usage: 
        ${scaleStorageUnites(storageEstimate.usage)}`}
      </Typography>
      <Typography>
        {`Total Storage: 
        ${scaleStorageUnites(storageEstimate.quota)}`}
      </Typography>
      {storageEstimate ? (
        <LinearProgressWithLabel
          variant="buffer"
          value={
            ((storageEstimate.usage - originalFileSize) /
              storageEstimate.quota) *
            100
          }
          valueBuffer={
            ((storageEstimate.usage - originalFileSize + (file?.size ?? 0)) /
              storageEstimate.quota) *
            100
          }
          sx={{
            "& .MuiLinearProgress-dashed": {
              animation: "none",
              backgroundImage: "none",
              backgroundColor: "gray",
            },
            "& .MuiLinearProgress-bar": {
              transition: "none",
            },
          }}
        />
      ) : null}
      <Typography variant="caption">
        {"Storage estimates can be inaccurate"}
      </Typography>
      <input type="file" ref={inputFile} onChange={handleFileChange} hidden />
    </Stack>
  );
};

Upload.propTypes = {
  file: PropTypes.object,
  setFile: PropTypes.func.isRequired,
  originalFile: PropTypes.object,
};
