import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export const DeleteMediaDialog = ({
  openDeleteAlert,
  setOpenDeleteAlert,
  apiFunctions,
  mediaObj,
  mediaUniqueIdentifier,
}) => {
  return (
    <Dialog
      open={openDeleteAlert}
      onClose={setOpenDeleteAlert}
      aria-labelledby="delete-entry"
      aria-describedby="delete-this-media-from-library"
    >
      <DialogTitle>Deleting from library?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deleting this from your library will delete all data relating to this
          entry.
          <br />
          Item will be destroyed after refresh.
          <br />
          If not dropped already, please reconsider dropping instead.
          <br />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setOpenDeleteAlert(false)}>
          Cancel
        </Button>
        <Button
          color="error"
          onClick={() => {
            setOpenDeleteAlert(false);
            apiFunctions.deleteBook(mediaObj, mediaUniqueIdentifier);
          }}
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
