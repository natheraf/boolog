import * as React from "react";
import { AlertsContext } from "../context/Alerts";
import { Button } from "@mui/material";

export const Home = () => {
  const addAlert = React.useContext(AlertsContext).addAlert;

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
