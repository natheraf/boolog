import { Box, styled } from "@mui/material";

export const TimedLoadingBar = styled(Box)(
  ({ color, height, duration }) => `
  background-color: ${color};
  animation: line ${duration - 500}ms linear forwards;
  margin-top: -${height ?? "3px"};
  height: ${height ?? "3px"};
  border-radius: 3px;
  @keyframes line {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }
`
);
