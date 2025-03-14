import * as React from "react";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";

import { AlertsContext } from "../context/Alerts";
import { setBookWithFile } from "../api/IndexedDB/Books";
import { getFile } from "../api/IndexedDB/Files";

import {
  AppBar,
  Box,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Slide,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { Textarea } from "../components/Textarea";
import { DynamicButton } from "../components/DynamicButton";
import { Upload } from "../features/files/components/Upload";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DoneIcon from "@mui/icons-material/Done";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import CircularProgress from "@mui/material/CircularProgress";

const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CreateBook = ({
  open,
  setOpen,
  editBookObject,
  setDataObject,
  syncMediaObject,
}) => {
  const addAlert = React.useContext(AlertsContext).addAlert;
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const greaterThanMedium = useMediaQuery(theme.breakpoints.up("md"));
  const [bookObject, setBookObject] = React.useState({
    status: undefined,
    type: undefined,
  });
  const [restorableBookObject, setRestorableBookObject] = React.useState(null);
  const [originalFile, setOriginalFile] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [restorableFile, setRestorableFile] = React.useState(null);
  const [saveLoading, setSaveLoading] = React.useState(false);

  const handleClearAll = () => {
    setBookObject({
      status: undefined,
      type: undefined,
    });
    setRestorableFile(file);
    setRestorableBookObject(bookObject);
    setFile(null);
  };

  const handleUndoClear = () => {
    setBookObject(restorableBookObject);
    setFile(restorableFile);
    setRestorableBookObject(null);
    setRestorableFile(null);
  };

  const handleClose = () => {
    setOpen(false);
    handleClearAll();
  };

  const handleSave = () => {
    setSaveLoading(true);
    const keysToProcessMultiple = [
      "isbn",
      "authors",
      "genres_subjects",
      "publisher",
    ];
    keysToProcessMultiple.forEach(
      (key) =>
        (bookObject[key] = Array.isArray(bookObject[key])
          ? bookObject[key]
          : bookObject[key]?.split(",").map((isbn) => isbn.trim()))
    );
    setBookWithFile(bookObject, file, "_id")
      .then(() => {
        handleClose();
        setDataObject(bookObject);
        syncMediaObject();
      })
      .catch((error) => addAlert(error.toString(), "error"))
      .finally(() => setSaveLoading(false));
  };

  const handleOnChangeProperty = (key) => (event, value) => {
    setRestorableBookObject(null);
    if (value !== null) {
      setBookObject((prev) => ({
        ...prev,
        [key]: event?.target?.value ?? value,
      }));
    }
  };

  const bookKeys = () => {
    const keys = {
      common: [
        { label: "Title", key: "title", width: "40%", priority: 0 },
        {
          label: "Authors",
          key: "authors",
          width: "40%",
          priority: 1,
          placeholder: "Eiji Mikage, Miya Kazuki, Isuna Hasekura",
        },
        { label: "Description", key: "description", width: "40%", priority: 4 },
        {
          label: "Genres / Subjects",
          key: "genres_subjects",
          width: "20%",
          priority: 8,
          placeholder: "Action, Romance, Mystery, Thriller",
        },
        {
          label: "Year Released",
          key: "publish_year",
          width: "10%",
          priority: 7,
        },
        {
          label: "Number of Pages",
          key: "number_of_pages",
          width: "10%",
          priority: 10,
        },
        {
          label: "Number of Chapters",
          key: "number_of_chapters",
          width: "10%",
          priority: 11,
        },
        {
          label: "Number of Words",
          key: "number_of_words",
          width: "10%",
          priority: 12,
        },
      ],
      unique: [],
    };
    if (["novel", "light novel/manga"].includes(bookObject.type)) {
      keys.unique = [
        {
          label: "Publishers",
          key: "publisher",
          width: "40%",
          priority: 2,
          placeholder: "Yen Press, Yen On, J-Novel Club",
        },
        {
          label: "ISBNs",
          key: "isbn",
          width: "40%",
          priority: 3,
          placeholder: "9780316561105, 978-0316561105, 9780316561235",
        },
      ];
    } else if (["web novel", "webtoon"].includes(bookObject.type)) {
      keys.unique = [
        {
          label: "Release Schedule",
          key: "release_schedule",
          width: "10%",
          priority: 9,
        },
        { label: "Views", key: "views", width: "10%", priority: 13 },
      ];
    }
    Object.values(keys).forEach((array) =>
      array.toSorted((a, b) => a.priority - b.priority)
    );
    return keys;
  };

  React.useEffect(() => {
    if (editBookObject) {
      setBookObject(editBookObject);
      if (editBookObject.fileId) {
        getFile(editBookObject.fileId)
          .then((res) => {
            if (res) {
              setFile(res);
              setOriginalFile(res);
            }
          })
          .catch((error) => console.log(error));
      }
    }
  }, [editBookObject]);

  return (
    <Dialog
      maxWidth={"xl"}
      open={open}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
    >
      <AppBar sx={{ position: "sticky" }}>
        <Toolbar
          component={Stack}
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            sx={{ overflow: "hidden" }}
          >
            <Tooltip title="esc">
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" noWrap>
              {editBookObject === undefined ? "Create Entry" : "Edit Entry"}
            </Typography>
          </Stack>
          <Stack direction={"row"} spacing={2}>
            {restorableBookObject === null ? (
              <DynamicButton
                color="inherit"
                onClick={handleClearAll}
                endIcon={<DeleteIcon />}
                sx={{ alignItems: "center" }}
                icon={<DeleteIcon />}
                text={"Clear All"}
              />
            ) : (
              <DynamicButton
                color="inherit"
                onClick={handleUndoClear}
                endIcon={<RestoreFromTrashIcon />}
                sx={{ alignItems: "center" }}
                icon={<RestoreFromTrashIcon />}
                text={"Restore"}
              />
            )}
            <Divider orientation="vertical" flexItem />
            <Tooltip
              title={
                !bookObject.type ||
                !bookObject.status ||
                !bookObject.title?.length > 0
                  ? "Required: Type, Status, and Title"
                  : ""
              }
            >
              <Box>
                <DynamicButton
                  color="inherit"
                  onClick={handleSave}
                  endIcon={
                    saveLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{ alignItems: "center" }}
                  disabled={
                    !bookObject.type ||
                    !bookObject.status ||
                    !bookObject.title?.length > 0 ||
                    saveLoading
                  }
                  icon={
                    saveLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  text={"save"}
                />
              </Box>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack alignItems={"center"} spacing={2} p={2}>
        <Stack spacing={2} direction={greaterThanMedium ? "row" : "column"}>
          <Stack direction="column" spacing={1}>
            <Typography variant="body">Type: </Typography>
            <ToggleButtonGroup
              value={bookObject.type}
              exclusive
              onChange={handleOnChangeProperty("type")}
              aria-label="change book type"
              orientation={greaterThanSmall ? "horizontal" : "vertical"}
            >
              {["novel", "light novel/manga", "web novel", "webtoon"].map(
                (value) => (
                  <ToggleButton key={value} value={value} aria-label={value}>
                    {value}
                  </ToggleButton>
                )
              )}
            </ToggleButtonGroup>
          </Stack>
          <Stack direction="column" spacing={1}>
            <Typography variant="body">Status: </Typography>
            <ToggleButtonGroup
              value={bookObject.status}
              exclusive
              onChange={handleOnChangeProperty("status")}
              aria-label="change book status"
            >
              {[
                { title: "Read", value: "Reading", icon: PlayArrowIcon },
                { title: "Pause", value: "Paused", icon: PauseIcon },
                { title: "Drop", value: "Dropped", icon: StopIcon },
                {
                  title: "Plan to Read",
                  value: "Planning",
                  icon: PlaylistAddIcon,
                },
                { title: "Finish", value: "Finished", icon: DoneIcon },
              ].map((obj) => (
                <Tooltip key={obj.value} title={obj.title}>
                  <ToggleButton value={obj.value} aria-label={obj.value}>
                    <obj.icon />
                  </ToggleButton>
                </Tooltip>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Stack>
        <Stack direction={"column"} spacing={2}>
          <Divider>Shared Properties</Divider>
          <Grid
            gap={2}
            container
            direction={"row"}
            sx={{
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            {bookKeys().common.map((obj) => (
              <Grid item key={obj.key} sx={{ minWidth: obj.width }}>
                {obj.key === "description" ? (
                  <Textarea
                    theme={theme}
                    maxRows={5}
                    minRows={2}
                    aria-label={obj.label}
                    placeholder={obj.label}
                    sx={{ width: "100%" }}
                    value={bookObject[obj.key] ?? ""}
                    onChange={handleOnChangeProperty(obj.key)}
                  />
                ) : (
                  <TextField
                    label={obj.label}
                    fullWidth
                    required={obj.key === "title"}
                    id={`tf-${obj.key}`}
                    value={bookObject[obj.key] ?? ""}
                    onChange={handleOnChangeProperty(obj.key)}
                    placeholder={obj.placeholder}
                  />
                )}
              </Grid>
            ))}
          </Grid>
          <Divider>Unique Type Properties</Divider>
          <Grid
            gap={2}
            container
            direction={"row"}
            sx={{
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            {bookKeys().unique.map((obj) => (
              <Grid item key={obj.key} sx={{ minWidth: obj.width }}>
                <TextField
                  label={obj.label}
                  fullWidth
                  id={`tf-${obj.key}`}
                  value={bookObject[obj.key] ?? ""}
                  onChange={handleOnChangeProperty(obj.key)}
                  placeholder={obj.placeholder}
                />
              </Grid>
            ))}
          </Grid>
          <Divider>Links</Divider>
          <Grid
            gap={2}
            container
            direction={"row"}
            sx={{
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            {[
              {
                label: "Cover URL",
                key: "cover_url",
                width: "30%",
              },
              {
                label: "Link to Read",
                key: "read_link",
                width: "30%",
              },
              {
                label: "Links to Purchase",
                key: "purchase_links",
                width: "30%",
                priority: 14,
              },
            ].map((obj) => (
              <Grid item key={obj.key} sx={{ minWidth: obj.width }}>
                <TextField
                  label={obj.label}
                  fullWidth
                  value={bookObject[obj.key] ?? ""}
                  onChange={handleOnChangeProperty(obj.key)}
                />
              </Grid>
            ))}
          </Grid>
          <Upload
            file={file?.blob ?? file}
            setFile={setFile}
            originalFile={originalFile?.blob}
          />
        </Stack>
      </Stack>
    </Dialog>
  );
};

CreateBook.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  editBookObject: PropTypes.object,
  setDataObject: PropTypes.func.isRequired,
  syncMediaObject: PropTypes.func.isRequired,
};
