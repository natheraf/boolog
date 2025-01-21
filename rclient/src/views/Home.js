import * as React from "react";
import { AlertsContext } from "../context/Alerts";
import { Button } from "@mui/material";
import { handleSimpleRequest } from "../api/Axios";
import { getAllBooks } from "../api/IndexedDB/Books";
import {
  addUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  renameUser,
} from "../api/IndexedDB/Users";

export const Home = () => {
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
      <Button
        onClick={() => addUser("foo").then((result) => console.log(result))}
      >
        add user foo
      </Button>
      <Button
        onClick={() => deleteUser(5).then((result) => console.log(result))}
      >
        delete user
      </Button>
    </div>
  );
};
