import * as React from "react";
import { Fab, Slide, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { addBookFromEpub } from "../api/IndexedDB/Books";

export const CollapsibleFab = ({ setOpenEditor, setIsImporting }) => {
  const theme = useTheme();
  const [openButtons, setOpenButtons] = React.useState(false);
  const containerRef = React.useRef(null);
  const navigate = useNavigate();
  const inputFile = React.useRef(null);
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsImporting(true);
      addBookFromEpub(event.target.files[0]).then(() => {
        window.location.reload(false);
      });
    }
  };
  const handleEpubImportOnClick = () => {
    inputFile.current.click();
  };

  const icons = [
    {
      label: "Create New",
      color: "secondary",
      icon: <EditIcon />,
      onClick: () => setOpenEditor(true),
    },
    {
      label: "Search",
      color: "secondary",
      icon: <SearchIcon />,
      onClick: () => navigate("/books/search"),
    },
    {
      label: "Import EPUB",
      color: "secondary",
      icon: <FileUploadIcon />,
      onClick: handleEpubImportOnClick,
    },
  ];

  return (
    <Slide in={true} direction="up">
      <Stack
        gap={3}
        sx={{
          position: "fixed",
          bottom: 25,
          right: 25,
          zIndex: 1,
        }}
      >
        <Stack spacing={3} sx={{ overflow: "hidden", mb: -7, pb: 7 }}>
          {icons.map((obj, index) => (
            <Slide
              in={openButtons}
              direction="up"
              key={obj.label}
              timeout={
                200 * (icons.length - index) * theme.transitions.reduceMotion
              }
              container={containerRef.current}
            >
              <Tooltip title={obj.label} placement={"left"}>
                <Fab
                  color={obj.color}
                  aria-label={obj.label}
                  onClick={obj.onClick}
                >
                  {obj.icon}
                </Fab>
              </Tooltip>
            </Slide>
          ))}
        </Stack>
        <input type="file" ref={inputFile} onChange={handleFileChange} hidden />
        <Tooltip
          title={openButtons ? "Click to Close" : "Add an Entry"}
          placement={"left"}
        >
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => setOpenButtons((prev) => !prev)}
            ref={containerRef}
          >
            {openButtons ? <ExpandMoreIcon /> : <AddIcon />}
          </Fab>
        </Tooltip>
      </Stack>
    </Slide>
  );
};
