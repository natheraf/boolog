import { Box, Grid, Grow, Paper, Stack, Typography } from "@mui/material";

const printArray = (arr) => {
  return (
    arr.slice(0, Math.min(2, arr.length - 1)).join(", ") +
    (arr.length > 1 ? " and " : "") +
    (arr.length < 4
      ? arr[arr.length - 1]
      : arr.length - 3 + " other" + (arr.length - 3 > 1 ? "s" : ""))
  );
};

export const Tiles = ({ objectArray, keysData, actionArea }) => {
  return objectArray.items?.map((dataObject, index) => (
    <Grow
      key={dataObject.key}
      in={objectArray.total_items > 0}
      style={{
        transformOrigin: "0 0 0",
      }}
      timeout={600 * index + 1000}
    >
      <Paper>
        <Grid
          container
          direction={"row"}
          justifyContent={"left"}
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
          <Stack direction="row" sx={{ width: "70%" }}>
            <Grid
              item
              sx={{
                height: "100%",
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
            {actionArea ? actionArea() : null}
          </Stack>
        </Grid>
      </Paper>
    </Grow>
  ));
};
