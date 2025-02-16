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

export const ReaderFormat = ({ formatting, setFormatting }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openFormatting = Boolean(anchorEl);

  const handleOpenFormatting = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseFormatting = (event) => {
    setAnchorEl(null);
  };

  const handleStepValue = (key, direction) => {
    setFormatting((prev) => ({
      ...prev,
      [key]:
        direction === "increase"
          ? Math.min(
              prev[`_${key}Bounds`].max,
              prev[key] + (prev[`_${key}Step`] ?? 1)
            )
          : Math.max(
              prev[`_${key}Bounds`].min,
              prev[key] - (prev[`_${key}Step`] ?? 1)
            ),
    }));
  };

  const handleOnChangeField = (key) => (event) => {
    const value = event?.target;
    console.log(event?.target);
    setFormatting((prev) => ({
      ...prev,
      [key]: value,
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
          sx={{ minWidth: "300px", margin: 2 }}
        >
          <Typography variant="h5">{"Formatting"}</Typography>
          <Paper sx={{ width: "100%", p: 1 }}>
            <Stack spacing={1} alignItems={"center"}>
              <Typography variant="h6">{"Font Family"}</Typography>
              <Tooltip
                title="Some creators may use multiple fonts to convey intent: Consider sticking to the Original"
                placement="top"
                enterDelay={300}
                enterNextDelay={300}
              >
                <Select
                  value={formatting.fontFamily.value}
                  onChange={handleOnChangeField("fontFamily")}
                  size="small"
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
            { title: "Pages Shown", value: "pagesShown", endText: "pages" },
          ].map((obj) => (
            <Paper key={obj.value} sx={{ width: "100%", p: 1 }}>
              <Stack spacing={1} alignItems={"center"}>
                <Typography variant="h6">{obj.title}</Typography>
                <Stack
                  direction="row"
                  justifyContent={"space-evenly"}
                  sx={{ width: "100%" }}
                >
                  <IconButton
                    onClick={() => handleStepValue(obj.value, "decrease")}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Paper>
                    <TextField
                      sx={{ width: "7rem" }}
                      value={formatting[obj.value]}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {obj.endText}
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Paper>
                  <IconButton
                    onClick={() => handleStepValue(obj.value, "increase")}
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
                onChange={handleOnChangeField("textAlign")}
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
};
