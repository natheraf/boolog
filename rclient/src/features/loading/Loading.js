import * as React from "react";

import {
  Box,
  Fade,
  Grow,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";

export const Loading = ({
  loadingText,
  loadingProgress,
  subLoadingText,
  subLoadingProcess,
}) => {
  const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min) + min);

  const [skeleton, setSkeleton] = React.useState(null);
  const timeout = 300;
  const numberOfParagraphs = 7;
  const [growIn, setGrowIn] = React.useState(true);

  const generateSkeleton = () => {
    setSkeleton(
      [...Array(numberOfParagraphs)].map((e) => [
        randomNumber(1, 6),
        randomNumber(10, 90),
      ])
    );
  };

  const toggleGrow = () => {
    setGrowIn((prev) => {
      if (prev === false) {
        generateSkeleton();
      }
      return !prev;
    });
  };

  React.useState(() => {
    generateSkeleton();
    const intervalId = setInterval(
      toggleGrow,
      timeout * (numberOfParagraphs + 1)
    );

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Fade in={true} timeout={timeout}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          maskImage: "linear-gradient(to bottom, black 90%, transparent)",
        }}
      >
        <Stack
          spacing={1}
          alignItems={"center"}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            margin: "auto",
            overflow: "hidden",
          }}
        >
          <Grow
            in={growIn}
            timeout={timeout}
            style={{ transformOrigin: "top" }}
          >
            <Typography component="div" variant={"h2"} width={"20%"}>
              <Skeleton animation="wave" />
            </Typography>
          </Grow>
          {skeleton?.map(([paragraphLength, lastLine], index) => (
            <Grow
              key={index}
              in={growIn}
              timeout={(index + 1) * timeout}
              style={{ transformOrigin: "top" }}
            >
              <Stack alignItems={"center"} sx={{ width: "100%" }}>
                <Typography
                  component="div"
                  variant={"body1"}
                  width={"90%"}
                  sx={{ paddingLeft: "5%" }}
                >
                  <Skeleton animation="wave" />
                </Typography>
                {[...Array(paragraphLength)].map((e, index) => (
                  <Typography
                    key={index}
                    component="div"
                    variant={"body1"}
                    width={"90%"}
                  >
                    <Skeleton animation="wave" />
                  </Typography>
                ))}
                <Typography
                  component="div"
                  variant={"body1"}
                  width={"90%"}
                  sx={{
                    paddingRight: `${lastLine}%`,
                  }}
                >
                  <Skeleton animation="wave" />
                </Typography>
                <br />
              </Stack>
            </Grow>
          ))}
        </Stack>
        <Stack
          spacing={1}
          alignItems={"center"}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "30vh",
            margin: "auto",
          }}
        >
          <Typography variant="h5">
            {loadingText ?? "Loading, please wait..."}
          </Typography>
          {loadingProgress ? (
            <LinearProgress
              sx={{
                width: "50vw",
                "& .MuiLinearProgress-bar": {
                  transition: "none",
                },
              }}
              variant={"determinate"}
              value={
                loadingProgress !== null
                  ? Math.floor(
                      (loadingProgress?.current ?? 0) /
                        (loadingProgress?.total ?? 1)
                    ) * 100
                  : 0
              }
            />
          ) : null}
          {subLoadingText ? (
            <>
              <Typography variant="h6">
                {subLoadingText ??
                  "We are loading some loading, please wait..."}
              </Typography>
              <LinearProgress
                sx={{
                  width: "50%",
                  "& .MuiLinearProgress-bar": {
                    transition: "none",
                  },
                }}
                variant={subLoadingProcess ? "determinate" : "indeterminate"}
                value={
                  subLoadingProcess
                    ? Math.floor(
                        ((subLoadingProcess?.current ?? 0) /
                          (subLoadingProcess?.total ?? 1)) *
                          100
                      )
                    : 0
                }
              />
            </>
          ) : null}
        </Stack>
      </Box>
    </Fade>
  );
};

Loading.propTypes = {
  loadingText: PropTypes.string,
  loadingProgress: PropTypes.object,
  subLoadingText: PropTypes.string,
  subLoadingProcess: PropTypes.object,
};
