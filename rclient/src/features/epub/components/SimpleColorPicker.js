import {
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import HelpIcon from "@mui/icons-material/Help";

export const SimpleColorPicker = ({
  color,
  handleRadioOnClick,
  handleRadioChange,
  handleTextFieldChange,
}) => {
  return (
    <FormControl component={Stack} spacing={1}>
      <Stack>
        <FormLabel>{"Highlight Color"}</FormLabel>
        <RadioGroup
          row
          name="highlight-color-radio-group"
          sx={{ paddingLeft: 1 }}
          value={color}
          onChange={handleRadioChange}
        >
          {[
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
          ].map((obj) => (
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
      </Stack>
      <Stack spacing={1}>
        <Tooltip title="Enter a color name, RGB, HEX, or HSL" placement="left">
          <FormLabel>Custom</FormLabel>
          <IconButton
            size="small"
            onClick={() =>
              window
                .open(
                  "https://developer.mozilla.org/en-US/docs/Web/CSS/background-color",
                  "_blank"
                )
                .focus()
            }
          >
            <HelpIcon fontSize="small" htmlColor={"gray"} />
          </IconButton>
        </Tooltip>
        <TextField
          value={color ?? ""}
          onChange={handleTextFieldChange}
          size="small"
        />
      </Stack>
    </FormControl>
  );
};

SimpleColorPicker.propTypes = {
  color: PropTypes.string,
  handleRadioOnClick: PropTypes.func.isRequired,
  handleRadioChange: PropTypes.func.isRequired,
  handleTextFieldChange: PropTypes.func.isRequired,
};
