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
import { Link } from "react-router-dom";
import LinkIcon from "@mui/icons-material/Link";
import { MediaEdit } from "./MediaEdit";

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
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
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
        <Grid item key={dataObject.id ?? dataObject.isbn}>
          <Grow
            in={objectArray.items.length > 0}
            // style={{
            //   transformOrigin: "0 0 0",
            // }}
            timeout={600 * index + 1000}
          >
            <Paper sx={{ ...sizeProfiles, p: 1 }}>
              <Stack spacing={1}>
                <Grid
                  container
                  direction={"row"}
                  justifyContent={"space-evenly"}
                  alignItems={"center"}
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
                        wordWrap: "break-word",
                        display: "block",
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
                      {keysData.map((obj) =>
                        obj.key === "title" &&
                        dataObject.read_link !== undefined ? (
                          <Typography
                            key={obj.key}
                            variant={obj.variant}
                            sx={{
                              wordBreak: "break-word",
                              textWrap: "pretty",
                              textDecoration: "none",
                              color: theme.palette.text.primary,
                            }}
                            component={Link}
                            to={dataObject.read_link}
                            target="_blank"
                          >
                            <LinkIcon />
                            {`${obj.label} ${dataObject[obj.key]}`}
                          </Typography>
                        ) : (
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
                        )
                      )}
                    </Stack>
                  </Grid>
                  {actionArea &&
                  actionArea.position === "right" &&
                  greaterThanMid ? (
                    <Paper elevation={0}>
                      <MediaStatus
                        mediaObj={dataObject}
                        apiFunctions={actionArea.api}
                        mediaUniqueIdentifier={actionArea.mediaUniqueIdentifier}
                        orientation={"vertical"}
                      />
                    </Paper>
                  ) : null}
                </Grid>
                {actionArea &&
                (actionArea.position === "bottom" || !greaterThanMid) ? (
                  <Paper elevation={0}>
                    <Grid
                      container
                      direction={greaterThanSmall ? "row" : "column"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      p={1}
                      gap={1}
                    >
                      <MediaStatus
                        mediaObj={dataObject}
                        apiFunctions={actionArea.api}
                        mediaUniqueIdentifier={actionArea.mediaUniqueIdentifier}
                        orientation={"horizontal"}
                      />
                      {actionArea.inLibrary ? (
                        <MediaEdit
                          mediaObj={dataObject}
                          apiFunctions={actionArea.api}
                          mediaUniqueIdentifier={
                            actionArea.mediaUniqueIdentifier
                          }
                        />
                      ) : null}
                    </Grid>
                  </Paper>
                ) : null}
              </Stack>
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
