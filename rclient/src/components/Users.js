import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";
import { getAllUsers } from "../api/IndexedDB/Users";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useTheme } from "@emotion/react";
import { UserEdit } from "./UserEdit";

export const Users = () => {
  const theme = useTheme();
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

  const handleOpenEditor = () => {
    handleClose();
    setOpenEditor(true);
  };

  React.useEffect(() => {
    getAllUsers().then((users) => setUsers(users));
  }, []);

  return (
    <Box>
      <UserEdit open={openEditor} setOpen={setOpenEditor} />
      <Avatar
        onClick={handleClick}
        alt="user icon"
        src={localStorage.getItem("profilePicture")}
      >
        {localStorage.getItem("userName")?.[0].toUpperCase()}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={openUsers}
        onClose={handleClose}
        transitionDuration={200 * theme.transitions.reduceMotion}
      >
        <Stack spacing={1} alignItems={"center"} sx={{ minWidth: "200px" }}>
          <Stack spacing={1} padding={2} alignItems={"center"}>
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
            <Button variant="outlined">Edit User</Button>
          </Stack>
          <Divider>
            <Typography color="gray">More Users</Typography>
          </Divider>
          <List sx={{ width: "100%" }} disablePadding>
            {users
              .filter(
                (user) => user.id !== parseInt(localStorage.getItem("userId"))
              )
              .map((user) => (
                <ListItemButton onClick={handleClose} key={user.id}>
                  <ListItemIcon>
                    <Avatar>{user.profilePicture}</Avatar>
                  </ListItemIcon>
                  <ListItemText>{user.name}</ListItemText>
                </ListItemButton>
              ))}
            <ListItemButton onClick={handleOpenEditor}>
              <ListItemIcon sx={{ paddingLeft: 1 }}>
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText>Add a User</ListItemText>
            </ListItemButton>
          </List>
        </Stack>
      </Menu>
    </Box>
  );
};
