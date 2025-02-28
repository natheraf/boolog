import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import { getAllUsers } from "../api/IndexedDB/Users";
import { useTheme } from "@emotion/react";
import { UserEdit } from "./UserEdit";
import { changeUser } from "../api/IndexedDB/State";
import { UserInfoContext } from "../context/UserInfo";
import { useNavigate } from "react-router-dom";
import { handleSimpleRequest } from "../api/Axios";
import { AlertsContext } from "../context/Alerts";
import { ThemeContext } from "../App";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AnimationIcon from "@mui/icons-material/Animation";

export const Users = () => {
  const theme = useTheme();
  const { toggleColorMode, toggleReduceMotion } =
    React.useContext(ThemeContext);
  const navigate = useNavigate();
  const userInfoContext = React.useContext(UserInfoContext);
  const addAlert = React.useContext(AlertsContext).addAlert;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const openUsers = Boolean(anchorEl);
  const [users, setUsers] = React.useState([]);
  const [openEditor, setOpenEditor] = React.useState(false);
  const [editObject, setEditObject] = React.useState(undefined);
  const [quickSettings, setQuickSettings] = React.useState(() => {
    const res = [];
    if (theme.palette.mode === "dark") {
      res.push("dark");
    }
    if (theme.transitions.reduceMotion) {
      res.push("reduceMotionOff");
    }
    return res;
  });

  const handleQuickSettingsChange = (event, newQuickSettings) => {
    setQuickSettings(newQuickSettings);
  };

  const handleOpenEditor = (editCurrentUser) => {
    if (editCurrentUser === true) {
      setEditObject(
        users.find(
          (user) => user.id === parseInt(localStorage.getItem("userId"))
        )
      );
    }
    handleClose();
    setOpenEditor(true);
  };

  const handleCloseEditor = () => {
    setEditObject(undefined);
    setOpenEditor(false);
  };

  const handleSwitchUser = (userId) => {
    changeUser(userId).then(() => {
      window.location.reload();
    });
  };

  const handleLogout = () => {
    handleSimpleRequest("post", {}, "auth/signout")
      .then((res) => {
        addAlert(res.data.message, "info");
        userInfoContext
          .refreshAndIsLoggedIn()
          .then(() => window.location.reload());
      })
      .catch((error) => addAlert(error.toString(), "error"));
  };

  React.useEffect(() => {
    getAllUsers().then((users) => setUsers(users));
  }, [openEditor]);

  return (
    <Box>
      <UserEdit
        open={openEditor}
        handleClose={handleCloseEditor}
        editObject={editObject}
      />
      <Avatar
        onClick={handleClick}
        alt="user icon"
        src={localStorage.getItem("profilePicture")}
        aria-controls={openUsers ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openUsers ? "true" : undefined}
      >
        {localStorage.getItem("userName")?.[0].toUpperCase()}
      </Avatar>
      <Menu anchorEl={anchorEl} open={openUsers} onClose={handleClose}>
        <Stack
          spacing={1}
          alignItems={"center"}
          sx={{ minWidth: "200px", marginTop: 1 }}
        >
          <Stack spacing={1} alignItems={"center"}>
            <Typography variant="h5">
              Hello, {localStorage.getItem("userName")}!👋
            </Typography>
            <Avatar
              // onClick={} edit pfp
              alt="user icon"
              src={localStorage.getItem("profilePicture")}
              sx={{ width: "100px", height: "100px" }}
            >
              {localStorage.getItem("userName")?.[0].toUpperCase()}
            </Avatar>
          </Stack>
          <List sx={{ width: "100%" }} disablePadding>
            <ListItemButton onClick={() => handleOpenEditor(true)}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary={"Edit User"} />
            </ListItemButton>
            {userInfoContext.isLoggedIn() ? (
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary={"Logout"} />
              </ListItemButton>
            ) : (
              <ListItemButton
                onClick={() => {
                  navigate("/login");
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary={"Login"} />
              </ListItemButton>
            )}
          </List>
          <Divider flexItem>
            <Typography color="gray">More Users</Typography>
          </Divider>
          <List sx={{ width: "100%" }} disablePadding>
            {users
              .filter(
                (user) => user.id !== parseInt(localStorage.getItem("userId"))
              )
              .map((user) => (
                <ListItemButton
                  onClick={() => handleSwitchUser(user.id)}
                  key={user.id}
                >
                  <ListItemIcon>
                    <Avatar alt="user icon" src={user.profilePicture}>
                      {user.name?.[0].toUpperCase()}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary={user.name} />
                </ListItemButton>
              ))}
            <ListItemButton onClick={handleOpenEditor}>
              <ListItemIcon sx={{ paddingLeft: 1 }}>
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText primary={"Add a User"} />
            </ListItemButton>
          </List>
          <Divider flexItem>
            <Typography color="gray">Quick Settings</Typography>
          </Divider>
          <ToggleButtonGroup
            value={quickSettings}
            onChange={handleQuickSettingsChange}
          >
            <Tooltip
              title={theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}
            >
              <ToggleButton onClick={toggleColorMode} value="dark">
                <DarkModeIcon />
              </ToggleButton>
            </Tooltip>
            <Tooltip
              title={
                theme.transitions.reduceMotion ? "Reduce Motion" : "Animations"
              }
            >
              <ToggleButton
                onClick={toggleReduceMotion}
                value="reduceMotionOff"
              >
                <AnimationIcon />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Stack>
      </Menu>
    </Box>
  );
};
