import * as React from "react";
import PropTypes from "prop-types";
import { IconButton, Menu, Stack, Tooltip, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { EpubViewEditor } from "./EpubViewEditor";
import CloseIcon from "@mui/icons-material/Close";
import { EpubNavigationDisplayOption } from "./EpubNavigationDisplayOption";
import { putEpubData } from "../../../api/IndexedDB/epubData";
import { EpubHeaderEditor } from "./EpubHeaderEditor";

export const EpubSettings = ({
  displayOptions,
  setDisplayOptions,
  clearHeaderHideTimeoutId,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openSettings = Boolean(anchorEl);

  const handleOpen = (event) => {
    clearHeaderHideTimeoutId();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const setDisplayOptionsHelper = (newDisplayOptions) => {
    setDisplayOptions(newDisplayOptions);
    putEpubData(
      { key: "epubGlobalDisplayOptions", displayOptions: newDisplayOptions },
      true
    );
  };

  return (
    <>
      <Tooltip title="Settings (f)">
        <IconButton onClick={handleOpen}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={openSettings}
        onClose={handleClose}
        disableRestoreFocus={true}
      >
        <Stack
          spacing={2}
          alignItems={"center"}
          sx={{ width: "300px", padding: 2 }}
        >
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            sx={{ width: "100%" }}
          >
            <Typography noWrap variant="h5">
              {"Settings"}
            </Typography>
            <Tooltip title={"Close (esc)"}>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <EpubHeaderEditor
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptionsHelper}
          />
          <EpubViewEditor
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptionsHelper}
          />
          <EpubNavigationDisplayOption
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptionsHelper}
          />
        </Stack>
      </Menu>
    </>
  );
};

EpubSettings.propTypes = {
  displayOptions: PropTypes.object.isRequired,
  setDisplayOptions: PropTypes.func.isRequired,
  clearHeaderHideTimeoutId: PropTypes.func.isRequired,
};
