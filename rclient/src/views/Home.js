import * as React from "react";
import { AlertsContext } from "../context/Alerts";
import { Button } from "@mui/material";
import { handleSimpleRequest } from "../api/Axios";
import { getAllBooks } from "../api/IndexedDB/Books";

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
    </div>
  );
};
