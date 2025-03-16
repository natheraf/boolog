import { styled, Tab, Tabs, Tooltip, tooltipClasses } from "@mui/material";

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
