import PropTypes from "prop-types";
import { FormControlLabel, Paper, Stack, Switch } from "@mui/material";

export const EpubDisplayOption = ({ displayOptions, setDisplayOptions }) => {
  const handleCheckedOnChange = (key) => (event) => {
    const checked = event.target.checked;
    setDisplayOptions((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <Paper sx={{ width: "100%", paddingRight: 3 }}>
      <Stack direction={"column"}>
        <FormControlLabel
          control={<Switch />}
          checked={displayOptions.showSpineNavigator}
          onChange={handleCheckedOnChange("showSpineNavigator")}
          label="Chapter Tabs on Left"
          slotProps={{ typography: { variant: "subtitle1" } }}
          labelPlacement="start"
        />
        {displayOptions.view === "page" && (
          <>
            <FormControlLabel
              control={<Switch />}
              checked={displayOptions.showPageNavigator}
              onChange={handleCheckedOnChange("showPageNavigator")}
              label="Page Tabs on Right"
              slotProps={{ typography: { variant: "subtitle1" } }}
              labelPlacement="start"
            />
            <FormControlLabel
              control={<Switch />}
              checked={displayOptions.showDividers}
              onChange={handleCheckedOnChange("showDividers")}
              label="Content Edge"
              slotProps={{ typography: { variant: "subtitle1" } }}
              labelPlacement="start"
            />
          </>
        )}
      </Stack>
    </Paper>
  );
};

EpubDisplayOption.propTypes = {
  displayOptions: PropTypes.object.isRequired,
  setDisplayOptions: PropTypes.func.isRequired,
};
