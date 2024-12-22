import { Box, Grid, useMediaQuery } from "@mui/material";
import * as React from "react";
import { DeleteMediaDialog } from "./DeleteMediaDialog";
import { useTheme } from "@emotion/react";
import { MediaStatus } from "./MediaStatus";
import { MediaEdit } from "./MediaEdit";

export const MediaController = ({ dataObject, actionArea, setDataObject }) => {
  const theme = useTheme();
  const [mediaObject, setMediaObject] = React.useState({ status: null });
  const [openDeleteAlert, setOpenDeleteAlert] = React.useState(false);
  const [openEditor, setOpenEditor] = React.useState(false);
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

  const handleStatusOnChange = (event, value) => {
    if (value === null) {
      setOpenDeleteAlert(true);
    } else {
      dataObject.status = value;
      actionArea.api.setBook(dataObject).then((id) => {
        dataObject.id = id;
        syncMediaObject();
      });
    }
  };

  const syncMediaObject = () => {
    actionArea.api
      .getBook(
        actionArea.mediaUniqueIdentifier,
        dataObject[actionArea.mediaUniqueIdentifier]?.[0] ??
          dataObject[actionArea.mediaUniqueIdentifier]
      )
      .then((res) => {
        setMediaObject(() => {
          return res ?? { ...dataObject };
        });
      })
      .catch((error) => console.log(error));
  };

  React.useEffect(() => {
    syncMediaObject();
  }, []);

  return (
    <Box>
      <DeleteMediaDialog
        openDeleteAlert={openDeleteAlert}
        setOpenDeleteAlert={setOpenDeleteAlert}
        actionArea={actionArea}
        mediaObject={mediaObject}
        syncMediaObject={syncMediaObject}
        dataObject={dataObject}
      />
      <Grid
        container
        direction={greaterThanSmall ? "row" : "column"}
        justifyContent={"center"}
        alignItems={"center"}
        p={1}
        gap={1}
      >
        <MediaStatus
          mediaObject={mediaObject}
          handleStatusOnChange={handleStatusOnChange}
          orientation={actionArea.orientation}
        />
        {actionArea.inLibrary ? (
          <MediaEdit
            mediaObject={dataObject}
            setOpenEditor={setOpenEditor}
            setOpenDeleteAlert={setOpenDeleteAlert}
            openEditor={openEditor}
            setDataObject={setDataObject}
            syncMediaObject={syncMediaObject}
          />
        ) : null}
      </Grid>
    </Box>
  );
};
