import * as React from "react";
import { AlertContext } from "../components/AlertWrapper";
import { Button } from "@mui/material";

export const Home = () => {
  const alertContext = React.useContext(AlertContext);
  const addAlert = alertContext.addAlert;

  return (
    <div>
      <Button onClick={() => addAlert("info", "info")}>info</Button>
      <Button onClick={() => addAlert("success", "success")}>success</Button>
      <Button onClick={() => addAlert("warning", "warning")}>warning</Button>
      <Button onClick={() => addAlert("error", "error")}>error</Button>
      <h1>Home</h1>
    </div>
  );
};
