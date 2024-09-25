import { Box, styled } from "@mui/material";

export const FadingBox = styled(Box)(
  ({ duration, timeout, blurduration, blurtimeout }) => `
  animation: fadeOut ${duration}ms linear forwards ${timeout}ms, blurOut ${blurduration}ms linear forwards ${
    blurtimeout - blurduration
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
      filter: blur(${blurduration === 0 ? "0px" : "50px"});
    }
  }
`
);
