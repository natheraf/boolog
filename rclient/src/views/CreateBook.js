import * as React from "react";
import {
  AppBar,
  Button,
  Dialog,
  IconButton,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CreateBook = ({ open, setOpen }) => {
  const handleClose = () => setOpen(false);

  return (
    <Dialog
      maxWidth={"xl"}
      open={open}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
    >
      <AppBar sx={{ position: "sticky" }}>
        <Toolbar
          component={Stack}
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Create Entry</Typography>
          <Button
            color="inherit"
            onClick={handleClose}
            endIcon={<SaveIcon />}
            sx={{ alignItems: "center" }}
          >
            save
          </Button>
        </Toolbar>
      </AppBar>
      <TextField />
    </Dialog>
  );
};
