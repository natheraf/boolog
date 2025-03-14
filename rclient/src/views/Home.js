import * as React from "react";
import { AlertsContext } from "../context/Alerts";
import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { handleSimpleRequest } from "../api/Axios";
import { getAllBooks } from "../api/IndexedDB/Books";
import { addUser, deleteUser, getAllUsers } from "../api/IndexedDB/Users";
import { changeUser, getCurrentUser } from "../api/IndexedDB/State";
import { UserInfoContext } from "../context/UserInfo";

export const Home = () => {
  const userInfoContext = React.useContext(UserInfoContext);
  const addAlert = React.useContext(AlertsContext).addAlert;

  return (
    <div>
      <Button
        onClick={() =>
          indexedDB
            .databases()
            .then((databases) =>
              databases.map((database) =>
                window.indexedDB.deleteDatabase(database.name)
              )
            )
        }
        color="error"
      >
        If something is broken, click here to nuke local storage. Will reset
        app.
      </Button>
      <Stack spacing={3}>
        <Typography variant="h3">Hi, this is an epub reader!</Typography>
        <Typography variant="h5">
          Search only adds books as entries. They don't give you epubs. You can
          add entries to track books you're reading, read, dropped, or finished.
        </Typography>
        <Typography variant="h5">
          To import an EPUB, go to the library page, click on the plus button on
          the bottom right, and click on the import icon. You can also drag one
          or multiple into the library page.
        </Typography>
        <Typography variant="h5">
          To open the epub, click on the picture of the book cover.
        </Typography>
        <Divider />
        <Typography variant="h3">Epub Reader</Typography>
        <Typography variant="h6">
          To change pages: press on the side, use the arrow keys, or swipe
        </Typography>
        <Typography variant="h6">
          To open the annotator: highlight on desktop; highlight then
          press/resize the highlight on mobile.
        </Typography>
        <Typography variant="h6">
          To search: press on the search icon top right and type. Press enter to
          search.
        </Typography>
        <Typography variant="h6">
          To open the table of contents: click on the icon top right.
        </Typography>
        <Typography variant="h6">
          To change formatting: icon top right. fonts have google fonts if your
          connected to the internet and is cached on device.
        </Typography>
        <Typography variant="h6">
          To change pages/chapters: use the small tabs on top for pages and the
          bottom for chapters.
        </Typography>
        <Typography variant="h6">
          Having performance issues: go to formatting and disable `Show Pages on
          Top` and `Show Chapters on Bottom`
        </Typography>
        <Typography variant="h6">
          Press on your profile picture and there are buttons to toggle
          animations and dark/light modes.
        </Typography>
        <Typography variant="h6">Everything else is WIP</Typography>
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
