import * as React from "react";
import { useTheme } from "@emotion/react";
import {
  Box,
  Grid,
  Grow,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { MediaStatus } from "./MediaStatus";
import PropTypes from "prop-types";

const printArray = (arr) => {
  return (
    arr.slice(0, Math.min(2, arr.length - 1)).join(", ") +
    (arr.length > 1 ? " and " : "") +
    (arr.length < 4
      ? arr[arr.length - 1]
      : arr.length - 3 + " other" + (arr.length - 3 > 1 ? "s" : ""))
  );
};

export const Tiles = ({ objectArray, keysData, actionArea, size }) => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const [sizeProfiles, setSizeProfiles] = React.useState(() => {
    if (size === "large") {
      return {
        maxWidth: "800px",
      };
    } else {
      return {
        maxWidth: "600px",
      };
    }
  });
  // console.log("test") runs 3 times for some reason? should be fine cause external api only calls once

  return (
    <Grid container direction={"row"} justifyContent={"center"} gap={2}>
      {objectArray?.items?.map((dataObject, index) => (
        <Grid item key={dataObject.id}>
          <Grow
            in={objectArray.total_items > 0}
            style={{
              transformOrigin: "0 0 0",
            }}
            timeout={600 * index + 1000}
          >
            <Paper sx={sizeProfiles}>
              <Grid
                container
                direction={"row"}
                justifyContent={"space-evenly"}
                alignItems={"center"}
                p={1}
                gap={2}
              >
                <Grid item sx={{ width: "25%" }}>
                  <Box
                    component="img"
                    src={dataObject.cover_url}
                    alt={`cover for ${dataObject.title}`}
                    sx={{
                      borderRadius: "5px",
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </Grid>
                <Grid
                  item
                  sx={{
                    height: "100%",
                    width: "60%",
                  }}
                >
                  <Stack spacing={1}>
                    {keysData.map((obj) => (
                      <Typography
                        key={obj.key}
                        variant={obj.variant}
                        sx={{
                          wordBreak: "break-word",
                          textWrap: "pretty",
                        }}
                      >{`${obj.label} ${
                        Array.isArray(dataObject[obj.key])
                          ? printArray(dataObject[obj.key])
                          : dataObject[obj.key] ?? "N/A"
                      }`}</Typography>
                    ))}
                  </Stack>
                </Grid>
                {actionArea ? (
                  <MediaStatus
                    mediaObj={dataObject}
                    apiFunctions={actionArea.api}
                    mediaUniqueIdentifier={actionArea.mediaUniqueIdentifier}
                  />
                ) : null}
              </Grid>
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
