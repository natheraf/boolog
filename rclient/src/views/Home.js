import * as React from "react";
import { AlertsContext } from "../context/Alerts";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { handleSimpleRequest } from "../api/Axios";
import { getAllBooks } from "../api/IndexedDB/Books";
import { addUser, deleteUser, getAllUsers } from "../api/IndexedDB/Users";
import { changeUser, getCurrentUser } from "../api/IndexedDB/State";
import { UserInfoContext } from "../context/UserInfo";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const Home = () => {
  const userInfoContext = React.useContext(UserInfoContext);
  const addAlert = React.useContext(AlertsContext).addAlert;

  const updates = {
    "Update 3/21/25 6:35PM": [
      "Added back button in reader.",
      "Clicking added keys d and space to turn pages in reader.",
    ],
    "Update 3/19/25 4:18AM": [
      "Annotation viewer saves on countdown. Still saves immediately on close.",
      "Can change the color of each note in annotation viewer with popup.",
    ],
    "Update 3/18/25 3:55AM": [
      "Fixed bug where swiping in annotation viewer turns pages.",
      "Using an accordion for each chapter's notes for a better experience.",
      "Notes in annotation viewer each have a button to go to where they are located in the book.",
    ],
  };

  const nuke = async () => {
    const databases = await indexedDB.databases();
    for (const database of databases) {
      window.indexedDB.deleteDatabase(database.name);
    }

    window.localStorage.clear();

    await handleSimpleRequest("post", {}, "auth/signout");
    userInfoContext.refreshAndIsLoggedIn().then(() => window.location.reload());
  };

  return (
    <div>
      <Button onClick={nuke} color="error">
        If something is broken, click here to nuke local storage. Will logout
        and reset app.
      </Button>
      <Stack spacing={3}>
        <Stack spacing={2}>
          <Typography variant="h4">
            Hi, this is an epub reader / reading tracker!
          </Typography>
          <Typography variant="h5">
            Everything is work in progress so things will break until further
            notice D: Check here for updates
          </Typography>
          <Typography variant="h5">
            Search only adds books as entries. They don't give you epubs. You
            can add entries to track books you're reading, read, dropped, or
            finished.
          </Typography>
          <Typography variant="h5">
            To import an EPUB, go to the library page, click on the plus button
            on the bottom right, and click on the import icon. You can also drag
            one or multiple into the library page.
          </Typography>
          <Typography variant="h5">
            To open the epub, click on the picture of the book cover.
          </Typography>
        </Stack>

        <Divider />

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h4">How to use the EPUB Reader</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6">
              To change pages: press on the side, use the arrow keys, or swipe
            </Typography>
            <Typography variant="h6">
              To open the annotator: highlight on desktop; highlight then
              press/resize the highlight on mobile.
            </Typography>
            <Typography variant="h6">
              To view all your notes and memos for the book: click on the
              annotation viewer button top right.
            </Typography>
            <Typography variant="h6">
              To search: press on the search icon top right and type. Press
              enter to search.
            </Typography>
            <Typography variant="h6">
              To open the table of contents: click on the icon top right.
            </Typography>
            <Typography variant="h6">
              To change formatting: icon top right. fonts have google fonts if
              your connected to the internet and is cached on device.
            </Typography>
            <Typography variant="h6">
              To change pages/chapters: use the small tabs on top for pages and
              the bottom for chapters.
            </Typography>
            <Typography variant="h6">
              Having performance issues: go to formatting and disable `Show
              Pages on Top` and `Show Chapters on Bottom`
            </Typography>
            <Typography variant="h6">
              Press on your profile picture and there are buttons to toggle
              animations and dark/light modes.
            </Typography>
            <Typography variant="h6">Everything else is WIP</Typography>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {Object.entries(updates).map(([summary, details]) => (
          <Accordion key={summary}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">{summary}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ul>
                {details.map((text) => (
                  <li key={text}>
                    <Typography variant="h6">{text}</Typography>
                  </li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
      {/* <div>
        <Button onClick={() => addAlert("info", "info")}>info</Button>
        <Button onClick={() => addAlert("success", "success")}>success</Button>
        <Button onClick={() => addAlert("warning", "warning")}>warning</Button>
        <Button onClick={() => addAlert("error", "error")}>error</Button>
        <Button
          onClick={() => {
            getAllBooks()
              .then((res) => {
                handleSimpleRequest(
                  "POST",
                  {
                    data: res.map((entry) => {
                      entry.shelf = "books";
                      return entry;
                    }),
                  },
                  "lists/put/multiple"
                ).then((res) => console.log(res.data));
              })
              .catch((error) => addAlert(error.message, "error"));
          }}
        >
          Update all entries
        </Button>
        <Button
          onClick={() => {
            handleSimpleRequest("GET", {}, "lists/get/all").then((res) =>
              console.log(res.data)
            );
          }}
        >
          Get all entries
        </Button>
        <Button
          onClick={() => {
            handleSimpleRequest("GET", {}, "lists/get/multiple", {
              shelves: ["books", "movies"],
            }).then((res) => console.log(res.data));
          }}
        >
          Get books and movies
        </Button>

        <br />

        <Button
          onClick={() => {
            handleSimpleRequest(
              "POST",
              {
                data: {
                  key0: "value0",
                  key1: "value1",
                  key2: "value2",
                  key3: "value3",
                },
              },
              "settings/set/multiple"
            )
              .then((res) => console.log(res.data))
              .catch((error) => console.log(error));
          }}
        >
          set settings
        </Button>
        <Button
          onClick={() => {
            handleSimpleRequest("GET", {}, "settings/get/all")
              .then((res) => console.log(res.data))
              .catch((error) => console.log(error));
          }}
        >
          get all settings
        </Button>

        <br />

        <Button
          onClick={() => getAllUsers().then((result) => console.log(result))}
        >
          get all users
        </Button>
        <Button
          onClick={() => getCurrentUser().then((result) => console.log(result))}
        >
          get cur user
        </Button>
        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? addUser({ name: event.target.value }).then((result) =>
                  console.log(result)
                )
              : null
          }
          label="add user with name"
        />
        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? deleteUser(parseInt(event.target.value)).then((result) =>
                  console.log(result)
                )
              : null
          }
          label="delete user from userId"
        />
        <br />
        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? changeUser(parseInt(event.target.value)).then((result) => {
                  userInfoContext.refreshAndIsLoggedIn();
                  localStorage.setItem("userId", result);
                })
              : null
          }
          label="change current userId"
        />
      </div> */}
    </div>
  );
};
