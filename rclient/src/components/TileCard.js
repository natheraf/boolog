import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import * as React from "react";
import { MediaController } from "./MediaController";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const TileCard = ({ data, keysData, actionArea }) => {
  const theme = useTheme();
  const [dataObject, setDataObject] = React.useState(data);

  const printArray = (arr) => {
    return (
      arr.slice(0, Math.min(2, arr.length - 1)).join(", ") +
      (arr.length > 1 ? " and " : "") +
      (arr.length < 4
        ? arr[arr.length - 1]
        : arr.length - 3 + " other" + (arr.length - 3 > 1 ? "s" : ""))
    );
  };

  return (
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
            dataObject.read_link !== undefined &&
            dataObject.read_link.length > 0 ? (
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
      {actionArea ? (
        <Paper
          elevation={0}
          sx={actionArea.orientation === "horizontal" ? { width: "100%" } : {}}
        >
          <MediaController
            dataObject={dataObject}
            actionArea={actionArea}
            setDataObject={setDataObject}
          />
        </Paper>
      ) : null}
    </Grid>
  );
};

TileCard.propTypes = {
  data: PropTypes.object.isRequired,
  keysData: PropTypes.array.isRequired,
  actionArea: PropTypes.object,
};
