import * as React from "react";
import { getAllBooks, indexedDBBooksInterface } from "../api/IndexedDB";
import { Tiles } from "../components/Tiles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DoneIcon from "@mui/icons-material/Done";
import { useTheme } from "@emotion/react";
import { CollapsibleFab } from "../components/CollapsibleFab";
import { CreateBook } from "./CreateBook";

export const BookLog = () => {
  const theme = useTheme();
  const [library, setLibrary] = React.useState({
    Reading: { items: [], total_items: 0 },
    Paused: { items: [], total_items: 0 },
    Planning: { items: [], total_items: 0 },
    Dropped: { items: [], total_items: 0 },
    Finished: { items: [], total_items: 0 },
  });
  const [openEditor, setOpenEditor] = React.useState(false);
  const [accordionSettings, setAccordionSettings] = React.useState(
    localStorage.getItem("BookLogAccordionSettings") !== null
      ? JSON.parse(localStorage.getItem("BookLogAccordionSettings"))
      : {
          Reading: { defaultExpanded: true },
          Paused: { defaultExpanded: true },
          Planning: { defaultExpanded: true },
          Dropped: { defaultExpanded: false },
          Finished: { defaultExpanded: true },
        }
  );
  const [isLoading, setIsLoading] = React.useState(true);

  const keysData = [
    { key: "title", label: "", variant: "h5" },
    { key: "authors", label: "by ", variant: "h6" },
    {
      key: "publisher",
      label: "Published by ",
      variant: "subtitle1",
    },
    {
      key: "publish_year",
      label: "Published in ",
      variant: "body2",
    },
    {
      key: "number_of_pages",
      label: "Pages: ",
      variant: "body2",
    },
  ];

  const actionArea = {
    api: indexedDBBooksInterface,
    mediaUniqueIdentifier: "id",
    orientation: "horizontal",
    inLibrary: true,
  };

  const statuses = [
    {
      status: "Reading",
      label: "Reading",
      labelIcon: <PlayArrowIcon />,
    },
    {
      status: "Paused",
      label: "Paused",
      labelIcon: <PauseIcon />,
    },
    {
      status: "Planning",
      label: "Planning to Read",
      labelIcon: <PlaylistAddIcon />,
    },
    {
      status: "Dropped",
      label: "Dropped",
      labelIcon: <StopIcon />,
    },
    {
      status: "Finished",
      label: "Finished",
      labelIcon: <DoneIcon />,
    },
  ];

  React.useEffect(() => {
    getAllBooks()
      .then((res) => {
        const obj = {
          Reading: { items: [], total_items: 0 },
          Paused: { items: [], total_items: 0 },
          Planning: { items: [], total_items: 0 },
          Dropped: { items: [], total_items: 0 },
          Finished: { items: [], total_items: 0 },
        };
        for (const item of res) {
          obj[item.status].items.push(item);
        }
        setLibrary(obj);
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, []);

  if (isLoading) {
    return <Box />;
  }

  return (
    <Box>
      <CollapsibleFab setOpenEditor={setOpenEditor} />
      <CreateBook open={openEditor} setOpen={setOpenEditor} />
      <Stack>
        {statuses.map((obj, index) => (
          <Slide key={obj.status} timeout={300 * index + 500} in={true}>
            <Accordion defaultExpanded={true}>
              <AccordionSummary
                aria-controls={obj.label}
                expandIcon={<ExpandMoreIcon />}
              >
                <Stack direction="row" spacing={2} alignItems={"center"}>
                  {obj.labelIcon}
                  <Typography variant="h5">{obj.label}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Tiles
                    objectArray={library[obj.status]}
                    keysData={keysData}
                    actionArea={actionArea}
                  />
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Slide>
        ))}
      </Stack>
    </Box>
  );
};
