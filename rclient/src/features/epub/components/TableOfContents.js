import * as React from "react";
import PropTypes from "prop-types";

import {
  Divider,
  IconButton,
  Menu,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import TocIcon from "@mui/icons-material/Toc";

export const TableOfContents = ({ toc, handlePathHref }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openToc = Boolean(anchorEl);

  const handleOpenToc = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseToc = (event) => {
    setAnchorEl(null);
  };
  return (
    <>
      <Tooltip title="Table of Contents">
        <IconButton onClick={handleOpenToc}>
          <TocIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={openToc} onClose={handleCloseToc}>
        <Stack spacing={2} sx={{ width: "300px", padding: 2 }}>
          <Typography variant="h6">{"Table Of Contents"}</Typography>
          <Divider />
          {toc.map((obj) => (
            <Typography
              key={`${obj.src}-${obj.label}`}
              onClick={() => {
                handlePathHref(obj.src);
                handleCloseToc();
              }}
              sx={{ cursor: "pointer" }}
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
  toc: PropTypes.array.isRequired,
  handlePathHref: PropTypes.func.isRequired,
};
