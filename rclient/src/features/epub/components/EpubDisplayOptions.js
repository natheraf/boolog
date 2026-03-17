import PropTypes from "prop-types";
import {
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export const EpubDisplayOption = ({ displayOptions, setDisplayOptions }) => {
  const handleCheckedOnChange = (key) => (event) => {
    const checked = event.target.checked;
    setDisplayOptions({ ...displayOptions, [key]: checked });
  };

  return (
    <Paper sx={{ width: "100%", p: 1 }}>
      <Stack direction={"column"} alignItems={"center"} spacing={1}>
        <Typography variant="h6">Display Options</Typography>
        <Stack direction={"column"}>
          <FormControlLabel
            control={<Checkbox />}
            checked={displayOptions.showSpineNavigator}
            onChange={handleCheckedOnChange("showSpineNavigator")}
            label="Chapter Tabs on Left"
            slotProps={{ typography: { variant: "subtitle1" } }}
            labelPlacement="end"
          />
          {displayOptions.view === "page" && (
            <>
              <FormControlLabel
                control={<Checkbox />}
                checked={displayOptions.showPageNavigator}
                onChange={handleCheckedOnChange("showPageNavigator")}
                label="Page Tabs on Right"
                slotProps={{ typography: { variant: "subtitle1" } }}
                labelPlacement="end"
              />
              <FormControlLabel
                control={<Checkbox />}
                checked={displayOptions.showDividers}
                onChange={handleCheckedOnChange("showDividers")}
                label="Content Edge"
                slotProps={{ typography: { variant: "subtitle1" } }}
                labelPlacement="end"
              />
            </>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

EpubDisplayOption.propTypes = {
  displayOptions: PropTypes.object.isRequired,
  setDisplayOptions: PropTypes.func.isRequired,
};
