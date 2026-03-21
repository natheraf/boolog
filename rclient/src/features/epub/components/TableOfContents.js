import * as React from "react";
import PropTypes from "prop-types";

import {
  Divider,
  IconButton,
  Menu,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import TocIcon from "@mui/icons-material/Toc";
import CloseIcon from "@mui/icons-material/Close";
import { handlePathHref } from "../epubUtils";

export const TableOfContents = ({
  epubObject,
  spineIndex,
  setProgress,
  setProgressWithoutAddingHistory,
  setForceFocus,
}) => {
  const theme = useTheme();
  const spine = epubObject.spine;
  const toc = epubObject.toc;
  const spineIndexMap = epubObject.spineIndexMap;
  const currentSpineIndexLabel = spine[spineIndex].label;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openToc = Boolean(anchorEl);

  const handleOpenToc = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseToc = () => {
    setAnchorEl(null);
  };

  const handleOnClick = (src) => {
    handlePathHref(
      spineIndex,
      spineIndexMap,
      setProgress,
      setProgressWithoutAddingHistory,
      setForceFocus
    )(src);
    handleCloseToc();
  };

  return (
    <>
      <Tooltip title="Table of Contents">
        <IconButton onClick={handleOpenToc}>
          <TocIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={openToc}
        onClose={handleCloseToc}
        disableRestoreFocus={true}
      >
        <Stack spacing={2} sx={{ width: "300px", padding: 2 }}>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography noWrap variant="h6">
              {"Table Of Contents"}
            </Typography>
            <IconButton onClick={handleCloseToc} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />
          {toc.map((obj) => (
            <Typography
              key={`${obj.src}-${obj.label}`}
              onClick={() => handleOnClick(obj.src)}
              sx={{
                cursor: "pointer",
                fontWeight:
                  currentSpineIndexLabel === obj.label ? "bold" : "inherit",
                color:
                  currentSpineIndexLabel === obj.label
                    ? theme.palette.secondary.main
                    : "inherit",
              }}
            >
              {obj.label}
            </Typography>
          ))}
        </Stack>
      </Menu>
    </>
  );
};

TableOfContents.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  setProgress: PropTypes.func.isRequired,
  setProgressWithoutAddingHistory: PropTypes.func.isRequired,
  setForceFocus: PropTypes.func.isRequired,
};
