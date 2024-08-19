import * as React from "react";
import { Fab, Slide, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";

export const CollapsibleFab = () => {
  const [openButtons, setOpenButtons] = React.useState(false);
  const containerRef = React.useRef(null);
  const navigate = useNavigate();

  const icons = [
    {
      label: "edit",
      color: "secondary",
      icon: <EditIcon />,
      onClick: () => navigate("#"),
    },
    {
      label: "search",
      color: "secondary",
      icon: <SearchIcon />,
      onClick: () => navigate("/books/search"),
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
              timeout={200 * (icons.length - index)}
              container={containerRef.current}
            >
              <Fab
                color={obj.color}
                aria-label={obj.label}
                onClick={obj.onClick}
              >
                {obj.icon}
              </Fab>
            </Slide>
          ))}
        </Stack>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpenButtons((prev) => !prev)}
          ref={containerRef}
        >
          {openButtons ? <ExpandMoreIcon /> : <AddIcon />}
        </Fab>
      </Stack>
    </Slide>
  );
};
