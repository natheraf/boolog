import * as React from "react";
import PropTypes from "prop-types";
import {
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export const EpubHeaderEditor = ({ displayOptions, setDisplayOptions }) => {
  const handleCheckedOnChange = (key) => (event) => {
    const checked = event.target.checked;
    setDisplayOptions({ ...displayOptions, [key]: checked });
  };

  return (
    <Paper sx={{ width: "100%", p: 1 }}>
      <Stack direction={"column"} alignItems={"center"} spacing={1}>
        <Typography variant="h6">Header</Typography>
        <Stack direction={"column"}>
          <FormControlLabel
            control={<Checkbox />}
            checked={displayOptions.autoHideHeader}
            onChange={handleCheckedOnChange("autoHideHeader")}
            label="Auto Hide"
            slotProps={{ typography: { variant: "subtitle1" } }}
            labelPlacement="end"
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

EpubHeaderEditor.propTypes = {
  displayOptions: PropTypes.object.isRequired,
  setDisplayOptions: PropTypes.func.isRequired,
};
