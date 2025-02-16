import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  InputAdornment,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import TextFormatIcon from "@mui/icons-material/TextFormat";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

export const ReaderFormat = ({
  formatting,
  setFormatting,
  defaultFormatting,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openFormatting = Boolean(anchorEl);

  const handleOpenFormatting = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseFormatting = (event) => {
    setAnchorEl(null);
  };

  const [fieldState, setFieldState] = React.useState({
    fontSize: formatting.fontSize,
    fontSizeFocus: false,
    lineHeight: formatting.lineHeight,
    lineHeightFocus: false,
    pageMargins: formatting.pageMargins,
    pageMarginsFocus: false,
    pagesShown: formatting.pagesShown,
    pagesShownFocus: false,
    fontFamilyOpen: false,
  });

  const handleStepValue = (key, direction) => {
    const newValue =
      direction === "increase"
        ? Math.min(
            formatting[`_${key}Bounds`].max,
            formatting[key] + (formatting[`_${key}Step`] ?? 1)
          )
        : Math.max(
            formatting[`_${key}Bounds`].min,
            formatting[key] - (formatting[`_${key}Step`] ?? 1)
          );
    setFormatting((prev) => ({
      ...prev,
      [key]: newValue,
    }));
    setFieldState((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleOnChangeSelect = (key) => (event) => {
    const value = event?.target;
    setFormatting((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOnChangeField = (key) => (event) => {
    setFieldState((prev) => ({
      ...prev,
      [key]: event?.target?.value,
    }));
  };

  const handleFieldReturn = (key) => (event) => {
    if (event.key === "Enter" && isNaN(fieldState[key]) === false) {
      const newValue = Math.max(
        formatting[`_${key}Bounds`].min,
        Math.min(formatting[`_${key}Bounds`].max, parseInt(fieldState[key]))
      );
      setFormatting((prev) => ({ ...prev, [key]: newValue }));
      setFieldState((prev) => ({ ...prev, [key]: newValue }));
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
          sx={{ width: "300px", margin: 2 }}
        >
          <Typography variant="h5">{"Formatting"}</Typography>
          <Paper sx={{ width: "100%", p: 1 }}>
            <Stack spacing={1} alignItems={"center"}>
              <Typography variant="h6">{"Font Family"}</Typography>
              <Tooltip
                title="Some creators may use multiple fonts to convey intent: Consider sticking to the Original"
                placement="top"
                open={fieldState.fontFamilyOpen}
              >
                <Select
                  value={formatting.fontFamily.value}
                  onChange={handleOnChangeSelect("fontFamily")}
                  size="small"
                  onOpen={() => handleOnOpen("fontFamily")}
                  onClose={() => handleOnClose("fontFamily")}
                  fullWidth
                >
                  {formatting._fontFamilies.map((item) => {
                    if (item.group === "none") {
                      return null;
                    }
                    if (item.hasOwnProperty("group")) {
                      return (
                        <ListSubheader key={item.group}>
                          {item.group}
                        </ListSubheader>
                      );
                    }
                    return (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Tooltip>
            </Stack>
          </Paper>
          {[
            { title: "Font Size", value: "fontSize", endText: "%" },
            { title: "Line Height", value: "lineHeight", endText: "u" },
            { title: "Page Margins", value: "pageMargins", endText: "px" },
            { title: "Pages Shown", value: "pagesShown", endText: "pgs" },
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
                      formatting[`_${obj.value}Bounds`].min
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
                                <KeyboardReturnIcon
                                  fontSize="small"
                                  color="success"
                                />
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
                      formatting[`_${obj.value}Bounds`].max
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
              <Typography variant="h6">{"Justify"}</Typography>
              <Select
                value={formatting.textAlign.value}
                onChange={handleOnChangeSelect("textAlign")}
                size="small"
                fullWidth
              >
                {formatting._textAlignments.map((obj) => (
                  <MenuItem key={obj.value} value={obj.value}>
                    {obj.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Paper>
        </Stack>
      </Menu>
    </Box>
  );
};

ReaderFormat.propTypes = {
  formatting: PropTypes.object.isRequired,
  setFormatting: PropTypes.func.isRequired,
  defaultFormatting: PropTypes.object.isRequired,
};
