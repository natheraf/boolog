import { styled, TextareaAutosize } from "@mui/material";

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

export const Textarea = styled(TextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: 320px;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === "dark" ? "white" : grey[900]};
  background: ${theme.palette.mode === "dark" ? "#3c3c3c" : "#fff"};
  resize: vertical;
  ::placeholder {
    color: ${grey[300]};
    opacity: 1; /* Firefox */
  }

  &:hover {
    border-color: white;
  }

  &:focus {
    box-shadow: 0 0 0 2px ${theme.palette.primary.main};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`
);
