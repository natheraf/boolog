import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";

import { Button, Stack, Typography } from "@mui/material";

import FileUploadIcon from "@mui/icons-material/FileUpload";

export const Upload = ({ file, setFile }) => {
  const theme = useTheme();
  const inputFile = React.useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleOnClick = () => {
    inputFile.current.click();
  };

  return (
    <Stack
      sx={{
        border: "1px solid gray",
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
      spacing={"10px"}
      color={theme.palette.text.secondary}
      onClick={file ? null : handleOnClick}
    >
      <Typography justifySelf={"center"}>
        {file?.name ?? "Import File"}
      </Typography>
      {file !== null ? (
        <Button
          variant="text"
          color="error"
          component="label"
          onClick={() => setFile(null)}
          size="small"
        >
          {"Clear"}
        </Button>
      ) : (
        <FileUploadIcon />
      )}
      <input type="file" ref={inputFile} onChange={handleFileChange} hidden />
    </Stack>
  );
};

Upload.prototype = {
  file: PropTypes.object.isRequired,
  setFile: PropTypes.func.isRequired,
};
