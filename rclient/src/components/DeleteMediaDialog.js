import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";

export const DeleteMediaDialog = ({
  openDeleteAlert,
  setOpenDeleteAlert,
  actionArea,
  mediaObject,
  syncMediaObject,
  dataObject,
}) => {
  return (
    <Dialog
      open={openDeleteAlert}
      onClose={() => setOpenDeleteAlert(false)}
      aria-labelledby="delete-entry"
      aria-describedby="delete-this-media-from-library"
    >
      <DialogTitle>Deleting from library?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>
            Deleting this from your library will immediately destroy all data
            relating to this entry. Entry will be destroyed after refresh.
          </Typography>
          <br />
          <Typography>
            Please consider setting item as dropped instead of deleting.
          </Typography>
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
            actionArea.api
              .deleteBook(mediaObject, actionArea.mediaUniqueIdentifier)
              .then(() => {
                syncMediaObject();
                delete dataObject._id;
                delete dataObject.status;
                delete dataObject.fileId;
              });
          }}
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteMediaDialog.propTypes = {
  mediaObject: PropTypes.object.isRequired,
  actionArea: PropTypes.object.isRequired,
  openDeleteAlert: PropTypes.bool.isRequired,
  setOpenDeleteAlert: PropTypes.func.isRequired,
  syncMediaObject: PropTypes.func.isRequired,
  dataObject: PropTypes.object.isRequired,
};
