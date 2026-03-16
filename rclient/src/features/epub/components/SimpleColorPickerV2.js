import * as React from "react";
import PropTypes from "prop-types";
import ChromePicker from "react-color";
import {
  Backdrop,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Menu,
  Radio,
  RadioGroup,
  Stack,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";

export const SimpleColorPickerV2 = ({ highlightColor, setHighlightColor }) => {
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = React.useState(null);
  const openColorPicker = Boolean(colorPickerAnchorEl);

  const highlightColorOptions = [
    {
      value: "rgba(255, 255, 0, .2)",
      buttonColor: "rgba(255, 255, 0, 1)",
      label: "Yellow",
    },
    {
      value: "rgba(255, 0, 0, .2)",
      buttonColor: "rgba(255, 0, 0, 1)",
      label: "Red",
    },
    {
      value: "rgba(0, 255, 0, .2)",
      label: "green",
      buttonColor: "rgba(0, 255, 0, 1)",
    },
    {
      value: "rgba(0, 0, 255, .2)",
      label: "Blue",
      buttonColor: "rgba(0, 0, 255, 1)",
    },
  ];

  const handleOpenCustomColorPicker = () => {
    const customColorButton = document.getElementById("custom-color-button");
    setColorPickerAnchorEl(customColorButton);
  };
  const handleCloseCustomColorPicker = () => {
    setColorPickerAnchorEl(null);
  };

  const handleColorInputChange = (event) => {
    setHighlightColor(event.target.value);
  };

  const handleReactColorOnChange = (color) => {
    setHighlightColor(
      `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
    );
  };

  const handleRadioOnClick = (value) => {
    if (highlightColor === value) {
      setHighlightColor(null);
    }
  };

  return (
    <FormControl component={Stack} spacing={1}>
      <Stack>
        <FormLabel>{"Highlight Color"}</FormLabel>
        <Stack direction={"row"}>
          <RadioGroup
            row
            name="highlight-color-radio-group"
            sx={{ paddingLeft: 1 }}
            value={highlightColor}
            onChange={handleColorInputChange}
          >
            {highlightColorOptions.map((obj) => (
              <FormControlLabel
                key={obj.value}
                value={obj.value}
                control={
                  <Radio
                    sx={{
                      color: obj.buttonColor,
                      "&.Mui-checked": {
                        color: obj.buttonColor,
                      },
                    }}
                  />
                }
                onClick={() => handleRadioOnClick(obj.value)}
              />
            ))}
          </RadioGroup>
          <>
            <Backdrop
              open={openColorPicker}
              sx={{ zIndex: 1 /** to show above side buttons */ }}
            >
              <Menu
                anchorEl={colorPickerAnchorEl}
                open={openColorPicker}
                onClose={handleCloseCustomColorPicker}
                MenuListProps={{ sx: { py: 0 } }}
              >
                <ChromePicker
                  color={highlightColor ?? ""}
                  onChange={handleReactColorOnChange}
                />
              </Menu>
            </Backdrop>
            <IconButton
              id="custom-color-button"
              onClick={handleOpenCustomColorPicker}
            >
              {!highlightColor ||
              highlightColorOptions.some(
                (option) => option.value === highlightColor
              ) ? (
                <PaletteOutlinedIcon htmlColor="gray" />
              ) : (
                <PaletteIcon htmlColor={highlightColor} />
              )}
            </IconButton>
          </>
        </Stack>
      </Stack>
    </FormControl>
  );
};

SimpleColorPickerV2.propTypes = {
  highlightColor: PropTypes.string,
  setHighlightColor: PropTypes.func.isRequired,
};
