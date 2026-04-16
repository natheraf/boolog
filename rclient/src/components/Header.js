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

import { Users } from "./Users";
import GitHubIcon from "@mui/icons-material/GitHub";
import { AppIcon } from "../features/header/AppIcon";

export const Header = () => {
  const navigate = useNavigate();

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
            <Box onClick={() => navigate("/")}>
              <AppIcon />
            </Box>
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
