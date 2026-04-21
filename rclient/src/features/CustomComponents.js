import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  CircularProgress,
  Dialog,
  Menu,
  Slide,
  Stack,
  styled,
  Tab,
  Tabs,
  Tooltip,
  tooltipClasses,
  Typography,
} from "@mui/material";
import { isMobileDevice } from "../api/IndexedDB/common";
import { GlobalDataContext } from "./context/GlobalData";

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
    color: theme.palette.text.primary,
  },
}));

export const DialogSlideUpTransition = React.forwardRef(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  }
);

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

export const DatesInARow = ({ entry }) => {
  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      {entry.dateModified && (
        <Typography variant="subtitle2" color="gray">
          {`Modified: ${new Date(entry.dateModified).toLocaleString(undefined, {
            timeStyle: "short",
            dateStyle: "short",
          })}`}
        </Typography>
      )}
      {entry.dateCreated && (
        <Typography variant="subtitle2" color="gray">
          {`Created: ${new Date(entry.dateCreated).toLocaleString(undefined, {
            timeStyle: "short",
            dateStyle: "short",
          })}`}
        </Typography>
      )}
    </Stack>
  );
};

DatesInARow.propTypes = { entry: PropTypes.object.isRequired };

export const DynamicMenuAndDialog = (props) => {
  const onMobileDevice = isMobileDevice();
  return onMobileDevice ? (
    <Dialog {...props} fullScreen />
  ) : (
    <Menu {...props} />
  );
};

export const RandomFontTypography = ({ children, variant, fontSize }) => {
  const { randomFont } = React.useContext(GlobalDataContext);
  const font = randomFont?.family ?? null;
  return (
    <HtmlTooltip
      title={
        <Stack alignItems={"center"}>
          <Typography fontFamily={font}>{font}</Typography>
          <Typography>{`${font}`}</Typography>
        </Stack>
      }
    >
      <Typography
        variant={variant}
        sx={{
          fontSize,
          fontFamily: font,
          userSelect: "none",
        }}
      >
        {children}
      </Typography>
    </HtmlTooltip>
  );
};

RandomFontTypography.propTypes = {
  children: PropTypes.any,
  variant: PropTypes.string,
  fontSize: PropTypes.string,
};
