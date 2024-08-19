import * as React from "react";
import { getAllBooks, indexedDBBooksInterface } from "../api/IndexedDB";
import { Tiles } from "../components/Tiles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DoneIcon from "@mui/icons-material/Done";

export const BookLog = () => {
  const [library, setLibrary] = React.useState();

  React.useEffect(() => {
    getAllBooks((res) => {
      setLibrary({ items: res, total_items: res.length });
    });
  }, []);

  return (
    <Stack>
      {[
        {
          status: "Reading",
          label: "Reading",
          labelIcon: <PlayArrowIcon />,
          defaultExpanded: true,
        },
        {
          status: "Paused",
          label: "Paused",
          labelIcon: <PauseIcon />,
          defaultExpanded: true,
        },
        {
          status: "Planning",
          label: "Planning to Read",
          labelIcon: <PlaylistAddIcon />,
          defaultExpanded: true,
        },
        {
          status: "Dropped",
          label: "Dropped",
          labelIcon: <StopIcon />,
          defaultExpanded: false,
        },
        {
          status: "Finished",
          label: "Finished",
          labelIcon: <DoneIcon />,
          defaultExpanded: true,
        },
      ].map((obj) => (
        <Accordion key={obj.status} defaultExpanded={obj.defaultExpanded}>
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
                { key: "title", label: "", variant: "h4" },
                { key: "authors", label: "by ", variant: "h6" },
                {
                  key: "publisher",
                  label: "Published by ",
                  variant: "body",
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
                  variant: "subtitle2",
                },
              ]}
              actionArea={true}
              apiFunctions={indexedDBBooksInterface}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};
