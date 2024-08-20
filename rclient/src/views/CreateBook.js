import * as React from "react";
import {
  AppBar,
  Button,
  Dialog,
  Divider,
  Fade,
  Grid,
  IconButton,
  Slide,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@emotion/react";
import { Textarea } from "../components/Textarea";

const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CreateBook = ({ open, setOpen }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const [bookType, setBookType] = React.useState(null);

  const handleClose = () => {
    setOpen(false);
    setBookType(null);
  };

  const handleOnChangeBookType = (event, value) => {
    if (value !== null) setBookType(value);
  };

  const bookKeys = () => {
    const keys = [
      { label: "Title", key: "title", width: "40%", priority: 0 },
      { label: "Authors", key: "authors", width: "40%", priority: 1 },
      { label: "Description", key: "description", width: "40%", priority: 4 },
      {
        label: "Genres",
        key: "genres_subjects",
        width: "20%",
        priority: 8,
      },
      {
        label: "Year",
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
    ];
    if (["novel", "light novel/manga"].includes(bookType)) {
      keys.push(
        { label: "Publishers", key: "publisher", width: "40%", priority: 2 },
        { label: "ISBNs", key: "isbn", width: "20%", priority: 3 },
        {
          label: "Links to Purchase",
          key: "purchase_links",
          width: "20%",
          priority: 14,
        }
      );
    } else if (["web novel", "webtoon"].includes(bookType)) {
      keys.push(
        {
          label: "Release Schedule",
          key: "release_schedule",
          width: "10%",
          priority: 9,
        },
        { label: "Views", key: "views", width: "10%", priority: 13 }
      );
    }
    keys.sort((a, b) => a.priority - b.priority);
    return keys;
  };

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
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Create Entry</Typography>
          <Button
            color="inherit"
            onClick={handleClose}
            endIcon={<SaveIcon />}
            sx={{ alignItems: "center" }}
          >
            save
          </Button>
        </Toolbar>
      </AppBar>
      <Stack alignItems={"center"} spacing={2} p={2}>
        <ToggleButtonGroup
          value={bookType}
          exclusive
          onChange={handleOnChangeBookType}
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
        <Fade in={bookType !== null} mountOnEnter>
          <Stack direction={"column"} spacing={2}>
            <Grid
              gap={2}
              container
              direction={"row"}
              sx={{
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              {bookKeys().map((obj) => (
                <Grid item key={obj.key} sx={{ minWidth: obj.width }}>
                  {obj.key === "description" ? (
                    <Textarea
                      theme={theme}
                      maxRows={5}
                      minRows={2}
                      aria-label={obj.label}
                      placeholder={obj.label}
                      sx={{ width: "100%" }}
                    />
                  ) : (
                    <TextField label={obj.label} fullWidth />
                  )}
                </Grid>
              ))}
            </Grid>
            <Divider />
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
                  width: "40%",
                },
                {
                  label: "Link to Read",
                  key: "read_link",
                  width: "40%",
                },
              ].map((obj) => (
                <Grid item key={obj.key} sx={{ minWidth: obj.width }}>
                  <TextField label={obj.label} fullWidth />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Fade>
      </Stack>
    </Dialog>
  );
};
