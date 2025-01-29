import * as React from "react";
import { useTheme } from "@emotion/react";
import { Grid, Grow, Paper, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";
import { TileCard } from "./TileCard";

export const Tiles = ({ objectArray, keysData, actionArea, size }) => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const [sizeProfiles, setSizeProfiles] = React.useState(() => {
    if (size === "large") {
      return {
        maxWidth: "800px",
        minWidth: { md: "800px" },
      };
    } else {
      return {
        maxWidth: "600px",
        minWidth: { md: "600px" },
      };
    }
  });

  return (
    <Grid container direction={"row"} justifyContent={"center"} gap={2}>
      {objectArray?.items?.map((dataObject, index) => (
        <Grid item key={dataObject.id ?? dataObject.isbn ?? dataObject.xId}>
          <Grow
            in={objectArray.items.length > 0}
            // style={{
            //   transformOrigin: "0 0 0",
            // }}
            timeout={(600 * index + 1000) * theme.transitions.reduceMotion}
          >
            <Paper sx={{ ...sizeProfiles, p: 1 }}>
              <TileCard
                data={dataObject}
                keysData={keysData}
                actionArea={actionArea}
              />
            </Paper>
          </Grow>
        </Grid>
      ))}
    </Grid>
  );
};

Tiles.propTypes = {
  objectArray: PropTypes.object.isRequired,
  keysData: PropTypes.array.isRequired,
  actionArea: PropTypes.object,
  size: PropTypes.string,
};
