import * as React from "react";
import { Divider, IconButton, Stack, useMediaQuery } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";
import { CreateBook } from "../views/CreateBook";

export const MediaEdit = ({
  mediaObject,
  setOpenEditor,
  setOpenDeleteAlert,
  openEditor,
}) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

  const handleOpenEditor = () => {
    setOpenEditor(true);
  };

  return (
    <Stack direction="row" gap={1}>
      <CreateBook
        open={openEditor}
        setOpen={setOpenEditor}
        editBookObject={JSON.parse(JSON.stringify(mediaObject))}
      />
      {greaterThanSmall ? <Divider orientation="vertical" flexItem /> : null}
      <IconButton onClick={handleOpenEditor}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => setOpenDeleteAlert(true)}>
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};

MediaEdit.propTypes = {
  mediaObject: PropTypes.object.isRequired,
  setOpenEditor: PropTypes.func.isRequired,
  setOpenDeleteAlert: PropTypes.func.isRequired,
};
