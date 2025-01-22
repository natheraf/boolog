import * as React from "react";
import { AlertsContext } from "../context/Alerts";
import { Button, TextField } from "@mui/material";
import { handleSimpleRequest } from "../api/Axios";
import { getAllBooks } from "../api/IndexedDB/Books";
import {
  addUser,
  deleteUser,
  getAllUsers,
  renameUser,
} from "../api/IndexedDB/Users";
import { changeUser, getCurrentUser } from "../api/IndexedDB/State";
import { UserInfoContext } from "../context/UserInfo";

export const Home = () => {
  const userInfoContext = React.useContext(UserInfoContext);
  const addAlert = React.useContext(AlertsContext).addAlert;

  return (
    <div>
      <Button onClick={() => addAlert("info", "info")}>info</Button>
      <Button onClick={() => addAlert("success", "success")}>success</Button>
      <Button onClick={() => addAlert("warning", "warning")}>warning</Button>
      <Button onClick={() => addAlert("error", "error")}>error</Button>
      <h1>Home</h1>
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
                "lists/add/multiple"
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
          handleSimpleRequest(
            "GET",
            {},
            'lists/get/multiple/["books","movies"]'
          ).then((res) => console.log(res.data));
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
      <Button
        onClick={() =>
          renameUser(1, "foo").then((result) => console.log(result))
        }
      >
        rename user to foo
      </Button>
      <TextField
        onKeyDown={(event) =>
          event.key === "Enter"
            ? addUser(event.target.value).then((result) => console.log(result))
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
    </div>
  );
};
