import { AppBar, Box, Stack, Toolbar, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      sx={{
        position: "fixed",
        top: 0,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="inherit" alignItems={"inherit"} gap={5}>
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
          <Link to={"/"} style={{ textDecoration: "none", color: "white" }}>
            <Typography variant="h6">Library</Typography>
          </Link>
          <Link
            to={"/searchBook"}
            style={{ textDecoration: "none", color: "white" }}
          >
            <Typography variant="h6">Search</Typography>
          </Link>
        </Stack>
        <Stack>
          <Link
            to={"/login"}
            style={{ textDecoration: "none", color: "white" }}
          >
            <Typography variant="h6">Login</Typography>
          </Link>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
