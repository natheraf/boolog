import * as React from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { getGoogleFonts } from "../../../api/GoogleAPI";
import { defaultFormatting, fontFamilies } from "../../../api/Local";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import AddIcon from "@mui/icons-material/Add";
import { formattingNumberFields, justifyIcons } from "../formattingUtils";

export const EpubFormatEditor = ({
  formatting,
  setFormatting,
  epubPreset,
  view,
  setView,
}) => {
  const [allFonts, setAllFonts] = React.useState(fontFamilies);
  const [fieldFocused, setFieldFocused] = React.useState(null);
  const [focusedFieldValue, setFocusedFieldValue] = React.useState(null);

  const handleFieldOnFocus = (key) => {
    setFieldFocused(key);
    setFocusedFieldValue(formatting[key]);
  };

  const handleFieldOnBlur = () => {
    setFieldFocused(null);
    setFocusedFieldValue(null);
  };

  const handleOnChangeField = (event) => {
    setFocusedFieldValue(event?.target?.value);
  };

  const handleOnChangeAutoCompleteAndButtonGroup = (key) => (event, value) => {
    if (key === "fontFamily") {
      value ??= defaultFormatting.fontFamily;
      setFormatting({
        ...formatting,
        [key]: value,
      });
    }
    if (key === "textAlign" && value !== null) {
      setFormatting({
        ...formatting,
        [key]: defaultFormatting._textAlignments.find(
          (obj) => obj.value === value
        ),
      });
    }
  };

  const handleStepValue = (key, direction) => {
    let oldValue = formatting[key];
    if (oldValue === "Original") {
      oldValue = defaultFormatting[`_${key}Default`];
    }
    const newValue =
      direction === "increase"
        ? Math.min(
            defaultFormatting[`_${key}Bounds`].max,
            (oldValue + (defaultFormatting[`_${key}Step`] ?? 1)).toFixed(3)
          )
        : Math.max(
            defaultFormatting[`_${key}Bounds`].min,
            (oldValue - (defaultFormatting[`_${key}Step`] ?? 1)).toFixed(3)
          );
    setFormatting({
      ...formatting,
      [key]: newValue,
    });
  };

  const handleFieldReturn = (key) => (event) => {
    event.stopPropagation();
    if (event.key !== "Enter") {
      return;
    }
    event.target.blur();
    if (focusedFieldValue === formatting[key]) {
      return;
    }
    if (focusedFieldValue === "") {
      setFocusedFieldValue(defaultFormatting[key]);
      return setFormatting({ ...formatting, [key]: defaultFormatting[key] });
    }
    if (key.includes("Color")) {
      setFocusedFieldValue(defaultFormatting[key]);
      return setFormatting({ ...formatting, [key]: focusedFieldValue });
    }
    const value =
      focusedFieldValue.length === 0
        ? defaultFormatting[key]
        : focusedFieldValue;
    if (Number.isNaN(Number.parseFloat(value)) === false) {
      const newValue = Math.max(
        defaultFormatting[`_${key}Bounds`].min,
        Math.min(
          defaultFormatting[`_${key}Bounds`].max,
          Number.parseFloat(value).toFixed(3)
        )
      );
      setFormatting({ ...formatting, [key]: newValue });
      setFocusedFieldValue(newValue);
    }
  };

  const handleCheckedOnChange = (key) => (event) => {
    const checked = event.target.checked;
    setFormatting({
      ...formatting,
      [key]: checked,
    });
  };

  React.useEffect(() => {
    getGoogleFonts().then((res) => {
      setAllFonts([...fontFamilies, ...res.items]);
    });
  }, []);

  return (
    <Stack spacing={2} alignItems={"center"} sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", p: 1 }}>
        <Stack spacing={1} alignItems={"center"}>
          <Typography variant="h6">{"Font Family"}</Typography>
          <Tooltip
            title="Some creators may use multiple fonts to convey intent: Consider sticking to the Original"
            placement="top"
            open={fieldFocused === "fontFamily"}
          >
            <Autocomplete
              value={formatting.fontFamily}
              options={allFonts}
              groupBy={(option) =>
                option.group === undefined ? "Google Fonts" : option.group
              }
              isOptionEqualToValue={(option, value) =>
                (option.value ?? option.family) ===
                (value?.value ?? value?.family)
              }
              getOptionLabel={(option) => option.label ?? option.family}
              onChange={handleOnChangeAutoCompleteAndButtonGroup("fontFamily")}
              onOpen={() => handleFieldOnFocus("fontFamily")}
              onClose={handleFieldOnBlur}
              renderInput={(params) => <TextField {...params} />}
              size="small"
              fullWidth
            />
          </Tooltip>
        </Stack>
      </Paper>
      {formattingNumberFields
        .filter((obj) => epubPreset === "custom" || obj.advancedOption !== true)
        .map((obj) => (
          <Paper key={obj.value} sx={{ width: "100%", p: 1 }}>
            <Stack spacing={1} alignItems={"center"}>
              <Typography variant="h6">{obj.title}</Typography>
              <Stack
                direction="row"
                justifyContent={"space-evenly"}
                sx={{ width: "100%" }}
                spacing={1}
              >
                <IconButton
                  onClick={() => handleStepValue(obj.value, "decrease")}
                  disabled={
                    formatting[obj.value] <=
                    defaultFormatting[`_${obj.value}Bounds`].min
                  }
                >
                  {obj.decreaseIcon ? <obj.decreaseIcon /> : <RemoveIcon />}
                </IconButton>
                <Paper>
                  <TextField
                    fullWidth
                    value={
                      fieldFocused === obj.value
                        ? focusedFieldValue
                        : formatting[obj.value]
                    }
                    placeholder={defaultFormatting[obj.value].toString()}
                    InputProps={{
                      endAdornment: (
                        <Stack direction="row">
                          <InputAdornment position="end">
                            {obj.endText}
                          </InputAdornment>
                          {fieldFocused === obj.value ? (
                            <InputAdornment position="end">
                              <Tooltip title={"Press Enter to Apply"}>
                                <KeyboardReturnIcon
                                  fontSize="small"
                                  color="success"
                                />
                              </Tooltip>
                            </InputAdornment>
                          ) : null}
                        </Stack>
                      ),
                    }}
                    onChange={handleOnChangeField}
                    onBlur={handleFieldOnBlur}
                    onFocus={() => handleFieldOnFocus(obj.value)}
                    onKeyDown={handleFieldReturn(obj.value)}
                    size="small"
                  />
                </Paper>
                <IconButton
                  onClick={() => handleStepValue(obj.value, "increase")}
                  disabled={
                    formatting[obj.value] >=
                    defaultFormatting[`_${obj.value}Bounds`].max
                  }
                >
                  {obj.increaseIcon ? <obj.increaseIcon /> : <AddIcon />}
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))}
      <Paper sx={{ width: "100%", p: 1 }}>
        <Stack spacing={1} alignItems={"center"}>
          <Typography variant="h6">{`Justify: ${formatting.textAlign.label}`}</Typography>
          <ToggleButtonGroup
            value={formatting.textAlign.value}
            exclusive
            onChange={handleOnChangeAutoCompleteAndButtonGroup("textAlign")}
            aria-label="text alignment"
          >
            {defaultFormatting._textAlignments.map((obj) => {
              const Icon = justifyIcons.get(obj.value);
              return (
                <Tooltip key={obj.value} title={obj.label}>
                  <ToggleButton value={obj.value}>
                    <Icon />
                  </ToggleButton>
                </Tooltip>
              );
            })}
          </ToggleButtonGroup>
        </Stack>
      </Paper>
      {epubPreset === "custom" &&
        [
          { title: "Text Color", value: "textColor" },
          { title: "Page Color", value: "pageColor" },
        ].map((obj) => (
          <Paper key={obj.value} sx={{ width: "100%", p: 1 }}>
            <Stack spacing={1} alignItems={"center"}>
              <Typography variant="h6">{obj.title}</Typography>
              <Tooltip
                title="Enter a color name, RGB, HEX, or HSL"
                open={fieldFocused === obj.value}
              >
                <TextField
                  fullWidth
                  value={
                    fieldFocused === obj.value
                      ? focusedFieldValue
                      : formatting[obj.value]
                  }
                  placeholder={defaultFormatting[obj.value].toString()}
                  InputProps={{
                    endAdornment:
                      focusedFieldValue === obj.value ? (
                        <InputAdornment position="end">
                          <KeyboardReturnIcon
                            fontSize="small"
                            color="success"
                          />
                        </InputAdornment>
                      ) : null,
                  }}
                  onChange={handleOnChangeField}
                  onBlur={handleFieldOnBlur}
                  onFocus={() => handleFieldOnFocus(obj.value)}
                  onKeyDown={handleFieldReturn(obj.value)}
                  size="small"
                />
              </Tooltip>
            </Stack>
          </Paper>
        ))}
      <Paper>
        <Stack
          spacing={2}
          alignItems={"center"}
          justifyContent={"center"}
          sx={{ padding: 1 }}
        >
          <Stack direction={"row"}>
            <FormControlLabel
              control={<Switch />}
              checked={formatting.showArrows}
              onChange={handleCheckedOnChange("showArrows")}
              label="Show Arrows"
              slotProps={{ typography: { variant: "subtitle2" } }}
              labelPlacement="top"
            />
            <FormControlLabel
              control={<Switch />}
              checked={formatting.showDividers}
              onChange={handleCheckedOnChange("showDividers")}
              label="Show Edges"
              slotProps={{ typography: { variant: "subtitle2" } }}
              labelPlacement="top"
            />
          </Stack>
        </Stack>
        <Stack direction={"row"}>
          <FormControlLabel
            control={<Switch />}
            checked={formatting.showPageNavigator}
            onChange={handleCheckedOnChange("showPageNavigator")}
            label="Show Pages on Top"
            slotProps={{
              typography: {
                variant: "subtitle2",
                sx: { textAlign: "center" },
              },
            }}
            labelPlacement="top"
          />
          <FormControlLabel
            control={<Switch />}
            checked={formatting.showSpineNavigator}
            onChange={handleCheckedOnChange("showSpineNavigator")}
            label="Show Chapters on Bottom"
            slotProps={{
              typography: {
                variant: "subtitle2",
                sx: { textAlign: "center" },
              },
            }}
            labelPlacement="top"
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

EpubFormatEditor.propTypes = {
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
  epubPreset: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
};
