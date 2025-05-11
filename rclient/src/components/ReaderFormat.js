import * as React from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { getGoogleFonts } from "../api/IndexedDB/State";
import { defaultFormatting } from "../api/Local";

import TextFormatIcon from "@mui/icons-material/TextFormat";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import CloseIcon from "@mui/icons-material/Close";
import CloudIcon from "@mui/icons-material/Cloud";
import { UserInfoContext } from "../context/UserInfo";

export const ReaderFormat = ({
  formatting,
  setFormatting,
  useGlobalFormatting,
  setUseGlobalFormatting,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openFormatting = Boolean(anchorEl);

  const fontFamilies = React.useMemo(
    () => [
      { label: "Original", value: "inherit", group: null, kind: "local" },

      { label: "Serif", value: "serif", group: "Generic", kind: "local" },
      {
        label: "Sans-Serif",
        value: "sans-serif",
        group: "Generic",
        kind: "local",
      },
      {
        label: "Monospace",
        value: "monospace",
        group: "Generic",
        kind: "local",
      },
      { label: "Cursive", value: "cursive", group: "Generic", kind: "local" },
      { label: "Fantasy", value: "fantasy", group: "Generic", kind: "local" },
      { label: "Math", value: "math", group: "Generic" },
      { label: "Fangsong", value: "fangsong", group: "Generic", kind: "local" },
      {
        label: "System-UI",
        value: "system-ui",
        group: "Generic",
        kind: "local",
      },
    ],
    []
  );

  const [googleFonts, setGoogleFonts] = React.useState([]);

  const allFonts = React.useMemo(
    () => fontFamilies.concat(googleFonts),
    [fontFamilies, googleFonts]
  );

  const userInfoContext = React.useContext(UserInfoContext);
  const isLoggedIn = React.useRef(userInfoContext.isLoggedIn());

  const handleCheckedOnChange = (key) => (event) => {
    const checked = event.target.checked;
    if (key === "useGlobal") {
      setUseGlobalFormatting(!useGlobalFormatting);
    } else {
      setFormatting({
        ...formatting,
        [key]: checked,
      });
    }
  };

  const handleOpenFormatting = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseFormatting = (event) => {
    setAnchorEl(null);
  };

  const [fieldState, setFieldState] = React.useState({
    ...formatting,
    fontSizeFocus: false,
    lineHeightFocus: false,
    pageWidthFocus: false,
    pagesShownFocus: false,
    fontFamilyOpen: false,
    fontWeightFocus: false,
    textColorFocus: false,
    pageColorFocus: false,
    pageHeightMarginsFocus: false,
    textIndentFocus: false,
  });

  React.useEffect(() => {
    setFieldState((prev) => ({ ...prev, ...formatting }));
  }, [formatting]);

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
    setFieldState((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleOnChangeSelect = (key) => (event) => {
    const value = event?.target;
    setFormatting({
      ...formatting,
      [key]: value,
    });
  };

  const handleOnChangeAutoComplete = (key) => (event, value) => {
    if (!value) {
      value = defaultFormatting.fontFamily;
    }
    setFormatting({
      ...formatting,
      [key]: value,
    });
  };

  const handleOnChangeField = (key) => (event) => {
    setFieldState((prev) => ({
      ...prev,
      [key]: event?.target?.value,
    }));
  };

  const handleFieldReturn = (key) => (event) => {
    event.stopPropagation();
    if (event.key === "Enter" && fieldState[key] === "") {
      setFormatting({ ...formatting, [key]: defaultFormatting[key] });
      setFieldState({ ...formatting, [key]: defaultFormatting[key] });
      return;
    }
    if (event.key === "Enter" && key.indexOf("Color") !== -1) {
      setFormatting({ ...formatting, [key]: fieldState[key] });
      setFieldState({ ...formatting, [key]: fieldState[key] });
      return;
    }
    const value =
      fieldState[key].length === 0 ? defaultFormatting[key] : fieldState[key];
    if (event.key === "Enter" && isNaN(value) === false) {
      const newValue = Math.max(
        defaultFormatting[`_${key}Bounds`].min,
        Math.min(
          defaultFormatting[`_${key}Bounds`].max,
          parseFloat(value).toFixed(3)
        )
      );
      setFormatting({ ...formatting, [key]: newValue });
      setFieldState({ ...formatting, [key]: newValue });
    }
  };

  const handleFieldOnFocus = (key) => {
    setFieldState((prev) => ({
      ...prev,
      [`${key}Focus`]: true,
    }));
  };

  const handleFieldOnBlur = (key) => {
    setFieldState((prev) => ({
      ...prev,
      [key]: formatting[key],
      [`${key}Focus`]: false,
    }));
  };

  const handleOnOpen = (key) => {
    setFieldState((prev) => ({
      ...prev,
      [key]: formatting[key],
      [`${key}Open`]: true,
    }));
  };

  const handleOnClose = (key) => {
    setFieldState((prev) => ({
      ...prev,
      [key]: formatting[key],
      [`${key}Open`]: false,
    }));
  };

  React.useEffect(() => {
    getGoogleFonts().then((obj) => {
      setGoogleFonts(obj.items);
    });
  }, []);

  const DynamicCloudIcon = () =>
    isLoggedIn.current ? <CloudIcon htmlColor="gray" fontSize="small" /> : null;

  return (
    <Box>
      <Tooltip title="Format">
        <IconButton onClick={handleOpenFormatting}>
          <TextFormatIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={openFormatting}
        onClose={handleCloseFormatting}
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
              {"Formatting"}
            </Typography>
            <IconButton onClick={handleCloseFormatting} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Paper sx={{ width: "100%", p: 1 }}>
            <Stack spacing={1} alignItems={"center"}>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Typography variant="h6">{"Font Family"}</Typography>
                <DynamicCloudIcon />
              </Stack>
              <Tooltip
                title="Some creators may use multiple fonts to convey intent: Consider sticking to the Original"
                placement="top"
                open={fieldState.fontFamilyOpen ?? false}
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
                  onChange={handleOnChangeAutoComplete("fontFamily")}
                  onOpen={() => handleOnOpen("fontFamily")}
                  onClose={() => handleOnClose("fontFamily")}
                  renderInput={(params) => <TextField {...params} />}
                  size="small"
                  fullWidth
                />
              </Tooltip>
            </Stack>
          </Paper>
          {[
            { title: "Font Size", value: "fontSize", endText: "rem" },
            { title: "Font Weight", value: "fontWeight", endText: "abs" },
            {
              title: "Page Width",
              value: "pageWidth",
              endText: "px",
            },
            {
              title: "Page Height Margins",
              value: "pageHeightMargins",
              endText: "px",
            },
            { title: "Pages Shown", value: "pagesShown", endText: "pgs" },
            { title: "Indent", value: "textIndent", endText: "rem" },
            { title: "Line Height", value: "lineHeight", endText: "u" },
          ].map((obj) => (
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
                      fieldState[obj.value] <=
                      defaultFormatting[`_${obj.value}Bounds`].min
                    }
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Paper>
                    <TextField
                      fullWidth
                      value={fieldState[obj.value]}
                      placeholder={defaultFormatting[obj.value].toString()}
                      InputProps={{
                        endAdornment: (
                          <Stack direction="row">
                            <InputAdornment position="end">
                              {obj.endText}
                            </InputAdornment>
                            {fieldState[`${obj.value}Focus`] === true ? (
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
                      onChange={handleOnChangeField(obj.value)}
                      onBlur={() => handleFieldOnBlur(obj.value)}
                      onFocus={() => handleFieldOnFocus(obj.value)}
                      onKeyDown={handleFieldReturn(obj.value)}
                      size="small"
                    />
                  </Paper>
                  <IconButton
                    onClick={() => handleStepValue(obj.value, "increase")}
                    disabled={
                      fieldState[obj.value] >=
                      defaultFormatting[`_${obj.value}Bounds`].max
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
          <Paper sx={{ width: "100%", p: 1 }}>
            <Stack spacing={1} alignItems={"center"}>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Typography variant="h6">{"Justify"}</Typography>
                <DynamicCloudIcon />
              </Stack>
              <Select
                value={formatting.textAlign.value}
                onChange={handleOnChangeSelect("textAlign")}
                size="small"
                fullWidth
              >
                {defaultFormatting._textAlignments.map((obj) => (
                  <MenuItem key={obj.value} value={obj.value}>
                    {obj.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Paper>
          {[
            { title: "Text Color", value: "textColor" },
            { title: "Page Color", value: "pageColor" },
          ].map((obj) => (
            <Paper key={obj.value} sx={{ width: "100%", p: 1 }}>
              <Stack spacing={1} alignItems={"center"}>
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                  <Typography variant="h6">{obj.title}</Typography>
                  <DynamicCloudIcon />
                </Stack>
                <Tooltip
                  title="Enter a color name, RGB, HEX, or HSL"
                  open={fieldState[`${obj.value}Focus`] ?? false}
                  placement="top"
                >
                  <TextField
                    fullWidth
                    value={fieldState[obj.value]}
                    placeholder={defaultFormatting[obj.value].toString()}
                    InputProps={{
                      endAdornment:
                        fieldState[`${obj.value}Focus`] === true ? (
                          <InputAdornment position="end">
                            <KeyboardReturnIcon
                              fontSize="small"
                              color="success"
                            />
                          </InputAdornment>
                        ) : null,
                    }}
                    onChange={handleOnChangeField(obj.value)}
                    onBlur={() => handleFieldOnBlur(obj.value)}
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
              <DynamicCloudIcon />
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
              <FormControlLabel
                control={<Switch />}
                checked={useGlobalFormatting}
                onChange={handleCheckedOnChange("useGlobal")}
                label="Use Global"
                labelPlacement="start"
              />
            </Stack>
          </Paper>
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
        </Stack>
      </Menu>
    </Box>
  );
};

ReaderFormat.propTypes = {
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
  useGlobalFormatting: PropTypes.bool.isRequired,
  setUseGlobalFormatting: PropTypes.func.isRequired,
};
