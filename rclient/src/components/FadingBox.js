import { Box, styled } from "@mui/material";

export const FadingBox = styled(Box)(
  ({ duration, timeout, blurDuration, blurTimeout }) => `
  animation: fadeOut ${duration}ms linear forwards ${timeout}ms, blurOut ${blurDuration}ms linear forwards ${
    blurTimeout - blurDuration
  }ms;
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: .5;
    }
  }

  @keyframes blurOut {
    from {
      filter: blur(0px);
    }
    to {
      filter: blur(${blurDuration === 0 ? "0px" : "50px"});
    }
  }
`
);
