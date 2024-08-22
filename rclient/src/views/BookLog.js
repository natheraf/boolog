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
  Switch,
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
  const [library, setLibrary] = React.useState();
  const [openEditor, setOpenEditor] = React.useState(false);
  const [defaultExpanded, setDefaultExpanded] = React.useState(
    localStorage.getItem("BookLogDefaultExpanded") ?? {
      Reading: true,
      Paused: true,
      Planning: true,
      Dropped: false,
      Finished: true,
    }
  );

  React.useEffect(() => {
    getAllBooks()
      .then((res) => setLibrary({ items: res, total_items: res.length }))
      .catch((error) => console.log(error));
  }, []);

  return (
    <Box>
      <CollapsibleFab setOpenEditor={setOpenEditor} />
      <CreateBook open={openEditor} setOpen={setOpenEditor} />
      <Stack>
        {[
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
        ].map((obj, index) => (
          <Slide key={obj.status} timeout={300 * index + 500} in={true}>
            <Accordion defaultExpanded={defaultExpanded[obj.status]}>
              <AccordionSummary
                aria-controls={obj.label}
                expandIcon={<ExpandMoreIcon />}
              >
                <Stack
                  direction="row"
                  justifyContent={"space-between"}
                  sx={{ display: "flex" }}
                >
                  <Stack direction="row" spacing={2} alignItems={"center"}>
                    {obj.labelIcon}
                    <Typography variant="h5">{obj.label}</Typography>
                  </Stack>
                  <Switch
                    defaultChecked={defaultExpanded[obj.status]}
                    onClick={(event) => event.stopPropagation()}
                    size="small"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Tiles
                    objectArray={{
                      items: library?.items?.filter(
                        (bookObj) => bookObj.status === obj.status
                      ),
                      total_items: library?.items?.filter(
                        (bookObj) => bookObj.status === obj.status
                      ).length,
                    }}
                    keysData={[
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
                      {
                        key: "isbn",
                        label: "ISBN: ",
                        variant: "body2",
                      },
                    ]}
                    actionArea={{
                      api: indexedDBBooksInterface,
                      mediaUniqueIdentifier: "id",
                    }}
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
