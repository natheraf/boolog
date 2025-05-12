import * as React from "react";
import {
  addBookFromEpub,
  addUrlsToLocalBooks,
  getAllBooks,
  indexedDBBooksInterface,
} from "../api/IndexedDB/Books";
import { Tiles } from "../components/Tiles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Collapse,
  Fade,
  Grid,
  Paper,
  Skeleton,
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
import { AlertsContext } from "../context/Alerts";
import { EpubReader } from "../components/EpubReader";
import { getFile } from "../api/IndexedDB/Files";
import {
  getEpubDataWithDefault,
  getEpubDataWithDefaultInDotNotation,
} from "../api/IndexedDB/epubData";
import { defaultFormatting } from "../api/Local";
import { Loading } from "../features/loading/Loading";

export const BookLog = () => {
  const addAlert = React.useContext(AlertsContext).addAlert;
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
  const [openEpubReader, setOpenEpubReader] = React.useState(false);
  const [epub, setEpub] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importingProgress, setImportingProgress] = React.useState({});

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

  const handleDrop = (event) => {
    event.preventDefault();
    let files = [];
    if (
      event.dataTransfer.items &&
      event.dataTransfer.items.length > 0 &&
      event.dataTransfer.items[0].kind === "file"
    ) {
      files = event.dataTransfer.items;
    } else if (
      event.dataTransfer.files &&
      event.dataTransfer.files.length > 0
    ) {
      files = event.dataTransfer.files;
    }
    setImportingProgress({ current: 0, total: files.length });
    if (files.length > 0) {
      setIsImporting(true);
      const resolves = [...Array(files.length)];
      const promises = [...Array(files.length)].map(
        (_, index) =>
          new Promise((resolve, reject) => (resolves[index] = resolve))
      );
      for (let index = 0; index < files.length; index += 1) {
        addBookFromEpub(files[index].getAsFile()).then((res) => {
          resolves[index](res);
          setImportingProgress((prev) => ({
            ...prev,
            current: prev.current + 1,
          }));
        });
      }
      Promise.all(promises).then(() => window.location.reload(false));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleOpenEpub = (id, fileId) =>
    getFile(fileId).then((data) => {
      if (!data) {
        return addAlert("File not found", "error");
      }
      const formatting = structuredClone(defaultFormatting);
      Object.keys(formatting).forEach(
        (key) => key.startsWith("_") && delete formatting[key]
      );
      formatting.pageWidth = Math.min(window.innerWidth, 700);
      getEpubDataWithDefault({
        key: "epubGlobalFormatting",
        formatting,
      }).then((res) => {
        const globalFormatting = res.formatting;
        getEpubDataWithDefaultInDotNotation(id, {
          key: id,
          formatting: {
            useGlobalFormatting: true,
            value: globalFormatting,
          },
          progress: { spine: 0, part: 0 },
          notes: {},
          memos: {},
        }).then((res) => {
          if (res.formatting.useGlobalFormatting) {
            res.formatting.value = globalFormatting;
          }
          data.epubObject = Object.assign(data.epubObject, res);
          setOpenEpubReader(Boolean(data.epubObject));
          setEpub({ object: data.epubObject, entryId: id });
        });
      });
    });

  const actionArea = {
    api: indexedDBBooksInterface,
    mediaUniqueIdentifier: ["_id", "xId"],
    orientation: "horizontal",
    inLibrary: true,
    imageOnClick: handleOpenEpub,
    imageOnClickKey: "fileId",
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

  const [expanded, setExpanded] = React.useState(() => {
    const res = {};
    for (const obj of statuses) {
      res[obj.status] = true;
    }
    return res;
  });

  React.useEffect(() => {
    getAllBooks()
      .then((res) =>
        addUrlsToLocalBooks(res).then((res) => {
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
      )
      .catch((error) => {
        console.log(error);
        addAlert(
          "Unable to get library data. Please contact support@ericma.net",
          "error"
        );
      });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, []);

  if (isLoading) {
    return (
      <Fade in={true} timeout={1000}>
        <Stack spacing={2}>
          {[4, 0, 3].map((numOfItems) => (
            <Paper key={numOfItems.toString()}>
              <Stack spacing={2} p={2}>
                <Skeleton variant="rounded" width={"100%"} height={60} />
                <Paper elevation={0}>
                  <Stack spacing={2} p={2}>
                    <Grid
                      container
                      direction={"row"}
                      justifyContent={"space-evenly"}
                      alignItems={"center"}
                      gap={2}
                    >
                      {[...Array(numOfItems).keys()].map((e) => (
                        <Grid item width={"600px"} key={e.toString()}>
                          <Paper>
                            <Stack direction="row" spacing={2} p={2}>
                              <Skeleton
                                variant="rounded"
                                width={"200px"}
                                height={"200px"}
                              />
                              <Stack
                                spacing={2}
                                justifyContent={"center"}
                                width={"100%"}
                              >
                                {[50, 30, 15, 10].map((heights) => (
                                  <Skeleton
                                    variant="rounded"
                                    width={"100%"}
                                    height={heights}
                                    key={heights.toString()}
                                  />
                                ))}
                              </Stack>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Paper>
              </Stack>
            </Paper>
          ))}
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
        </Stack>
      </Fade>
    );
  }

  if (isImporting) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "90vh",
        }}
      >
        <Loading
          loadingText={"Importing"}
          loadingProgress={importingProgress}
        />
      </Box>
    );
  }

  return (
    <>
      <CollapsibleFab
        setOpenEditor={setOpenEditor}
        setIsImporting={setIsImporting}
      />
      <CreateBook
        open={openEditor}
        setOpen={setOpenEditor}
        setDataObject={() => {}}
        syncMediaObject={() => window.location.reload()}
      />
      {epub && openEpubReader ? (
        <EpubReader
          open={openEpubReader}
          setOpen={setOpenEpubReader}
          epubObject={epub.object}
          entryId={epub.entryId}
          key={epub.entryId}
        />
      ) : null}
      <Stack onDrop={handleDrop} onDragOver={handleDragOver}>
        {statuses.map((obj, index) => (
          <Slide
            key={obj.status}
            timeout={(100 * index + 300) * theme.transitions.reduceMotion}
            in={true}
          >
            <Accordion
              expanded={expanded[obj.status]}
              slots={{ transition: Collapse }}
              slotProps={{
                transition: { timeout: 400 * theme.transitions.reduceMotion },
              }}
              onChange={() => {
                setExpanded((prev) => ({
                  ...prev,
                  [obj.status]: !prev[obj.status],
                }));
              }}
            >
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
    </>
  );
};
