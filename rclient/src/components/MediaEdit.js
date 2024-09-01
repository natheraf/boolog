import * as React from "react";
import { Divider, IconButton, Stack, useMediaQuery } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";
import { DeleteMediaDialog } from "./DeleteMediaDialog";
import { CreateBook } from "../views/CreateBook";

export const MediaEdit = ({
  mediaObj,
  apiFunctions,
  mediaUniqueIdentifier,
}) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const [openDeleteAlert, setOpenDeleteAlert] = React.useState(false);
  const [openEditor, setOpenEditor] = React.useState(false);

  const handleOpenEditor = () => {
    setOpenEditor(true);
  };

  return (
    <Stack direction="row" gap={1}>
      <DeleteMediaDialog
        openDeleteAlert={openDeleteAlert}
        setOpenDeleteAlert={setOpenDeleteAlert}
        apiFunctions={apiFunctions}
        mediaObj={mediaObj}
        mediaUniqueIdentifier={mediaUniqueIdentifier}
        setMediaObj={}
      />
      <CreateBook
        open={openEditor}
        setOpen={setOpenEditor}
        editBookObject={JSON.parse(JSON.stringify(mediaObj))}
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
  mediaObj: PropTypes.object.isRequired,
  apiFunctions: PropTypes.object.isRequired,
  mediaUniqueIdentifier: PropTypes.string.isRequired,
};
