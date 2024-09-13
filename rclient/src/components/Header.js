import React from "react";
import {
  AppBar,
  Box,
  Grid,
  Stack,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ThemeContext } from "../App";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export const Header = () => {
  const navigate = useNavigate();
  const { toggleColorMode, toggleReduceMotion } =
    React.useContext(ThemeContext);
  const theme = useTheme();

  return (
    <AppBar
      sx={{
        position: "fixed",
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
          <Stack direction="row" alignItems={"center"}>
            <Link
              to={"/login"}
              style={{ textDecoration: "none", color: "white" }}
            >
              <Typography variant="h6">Login</Typography>
            </Link>
            <IconButton
              sx={{ ml: 1 }}
              onClick={toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
            <IconButton
              sx={{ ml: 1 }}
              onClick={toggleReduceMotion}
              color="inherit"
            >
              {theme.transitions.reduceMotion ? (
                <VisibilityOffIcon />
              ) : (
                <VisibilityIcon />
              )}
            </IconButton>
          </Stack>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};
