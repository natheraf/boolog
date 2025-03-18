import React from "react";
import {
  AppBar,
  Box,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import { ThemeContext } from "../App";
import { handleSimpleRequest } from "../api/Axios";
import { AlertsContext } from "../context/Alerts";
import { UserInfoContext } from "../context/UserInfo";
import { Users } from "./Users";
import GitHubIcon from "@mui/icons-material/GitHub";

export const Header = () => {
  const navigate = useNavigate();
  const addAlert = React.useContext(AlertsContext).addAlert;
  const { toggleColorMode, toggleReduceMotion } =
    React.useContext(ThemeContext);
  const theme = useTheme();
  const userInfoContext = React.useContext(UserInfoContext);

  const handleLogout = () => {
    handleSimpleRequest("post", {}, "auth/signout")
      .then((res) => {
        addAlert(res.data.message, "info");
        userInfoContext.refreshAndIsLoggedIn().then(() => navigate("/"));
      })
      .catch((error) => addAlert(error.toString(), "error"));
  };

  return (
    <AppBar
      sx={{
        position: "sticky",
        top: 0,
        width: "100%",
      }}
    >
      <Toolbar>
        <Grid
          container
          justifyContent={{ xs: "space-around", sm: "space-between" }}
        >
          <Stack direction="row" alignItems={"center"} spacing={5} pr={5}>
            <Box
              component="img"
              src={require("../assets/logo_remix0-trimmed.png")}
              alt={`logo`}
              sx={{
                borderRadius: "5px",
                display: "block",
                width: "auto",
                height: "auto",
                maxWidth: "50px",
                maxHeight: "50px",
              }}
              onClick={() => navigate("/")}
            />
            <Link
              to={"/books"}
              style={{ textDecoration: "none", color: "white" }}
            >
              <Typography variant="h6">Library</Typography>
            </Link>
            <Link
              to={"/books/search"}
              style={{ textDecoration: "none", color: "white" }}
            >
              <Typography variant="h6">Search</Typography>
            </Link>
          </Stack>
          <Stack spacing={2} direction="row" alignItems={"center"}>
            <Tooltip title="Project Repository">
              <IconButton
                onClick={() =>
                  window
                    .open("https://github.com/natheraf/boolog", "_blank")
                    .focus()
                }
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>
            <Users />
          </Stack>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
