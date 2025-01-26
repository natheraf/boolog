import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import {
  AppBar,
  Avatar,
  Box,
  Dialog,
  Divider,
  IconButton,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import { DynamicButton } from "./DynamicButton";
import { userTemplates } from "../api/Local";
import { getAllUsers } from "../api/IndexedDB/Users";

// refactor to use one ver with CreateBook.js:35 DialogSlideUpTransition()
const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const UserEdit = ({ open, setOpen, editObject }) => {
  const theme = useTheme();
  const [restorableObject, setRestorableObject] = React.useState(null);
  const [user, setUser] = React.useState({});

  const handleClearAll = () => {
    setRestorableObject(user);
    setUser({
      status: undefined,
      type: undefined,
    });
  };

  const handleUndoClear = () => {
    setUser(restorableObject);
    setRestorableObject(null);
  };

  const handleClose = (event, reason) => {
    setOpen(false);
    if (editObject === undefined) {
      handleClearAll();
    }
  };

  const handleSave = () => {};

  const handleOnChangeProperty = (key) => (event, value) => {
    setRestorableObject(null);
    if (value !== null) {
      setUser((prev) => ({
        ...prev,
        [key]: event?.target?.value ?? value,
      }));
    }
  };

  React.useEffect(() => {
    if (open && editObject === undefined) {
      console.log(editObject);
      getAllUsers().then((users) => {
        const names = new Set(users.map((user) => user?.name));
        setUser(
          userTemplates.filter(
            (userTemplate) => names.has(userTemplate.name) === false
          )[Math.floor(Math.random() * userTemplates.length)]
        );
      });
    }
  }, [editObject, open]);

  return (
    <Dialog
      maxWidth={"xl"}
      open={open}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
      transitionDuration={200 * theme.transitions.reduceMotion}
    >
      <AppBar sx={{ position: "sticky" }}>
        <Toolbar
          component={Stack}
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
          spacing={2}
        >
          <Tooltip title="esc">
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6">
            {editObject === undefined ? "Create User" : "Edit User"}
          </Typography>
          <Stack direction={"row"} spacing={2}>
            {restorableObject === null ? (
              <DynamicButton
                color="inherit"
                onClick={handleClearAll}
                endIcon={<DeleteIcon />}
                sx={{ alignItems: "center" }}
                icon={<DeleteIcon />}
                text={"Clear All"}
              />
            ) : (
              <DynamicButton
                color="inherit"
                onClick={handleUndoClear}
                endIcon={<RestoreFromTrashIcon />}
                sx={{ alignItems: "center" }}
                icon={<RestoreFromTrashIcon />}
                text={"Restore"}
              />
            )}
            <Divider orientation="vertical" flexItem />
            <Tooltip
              title={!user?.name?.length > 0 ? "Required: Username" : ""}
            >
              <Box>
                <DynamicButton
                  color="inherit"
                  onClick={handleSave}
                  endIcon={<SaveIcon />}
                  sx={{ alignItems: "center" }}
                  disabled={!user?.name?.length > 0}
                  icon={<SaveIcon />}
                  text={"save"}
                />
              </Box>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack direction={"row"} spacing={5} p={3} alignItems={"center"}>
        <Avatar
          alt="user icon"
          src={user?.profilePicture}
          sx={{ width: "100px", height: "100px" }}
        >
          {user?.name?.[0]}
        </Avatar>
        <Stack alignItems={"center"} spacing={2}>
          {[
            { label: "Username", key: "name" },
            { label: "Image URL", key: "profilePicture" },
          ].map((obj) => (
            <TextField
              key={obj.key}
              label={obj.label}
              fullWidth
              required={obj.key === "name"}
              id={`tf-${obj.key}`}
              value={user?.[obj.key] ?? ""}
              onChange={handleOnChangeProperty(obj.key)}
              placeholder={obj.placeholder}
            />
          ))}
        </Stack>
      </Stack>
    </Dialog>
  );
};

UserEdit.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  editObject: PropTypes.object,
};
