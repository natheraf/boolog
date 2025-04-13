import * as React from "react";
import {
  Box,
  CircularProgress,
  Slide,
  styled,
  Tab,
  Tabs,
  Tooltip,
  tooltipClasses,
  Typography,
} from "@mui/material";

export const SmallTabs = styled(Tabs)(({ tabpanelheight }) => ({
  height: tabpanelheight,
  minHeight: tabpanelheight,
  ".MuiTabs-indicator": {
    borderRadius: "5px",
  },
}));
export const SmallTab = styled(Tab)(({ tabpanelheight }) => ({
  height: tabpanelheight,
  minHeight: tabpanelheight,
  borderRadius: "5px",
}));
export const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
  },
}));

export const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CircularProgressWithLabel = (props) => {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary" }}
        >
          {`${Math.round(props.value)}`}
        </Typography>
      </Box>
    </Box>
  );
};
