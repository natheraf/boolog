import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { GlobalDataContext } from "../context/GlobalData";
import { HtmlTooltip } from "../CustomComponents";

export const AppIcon = () => {
  const { randomFont, changeRandomFont } = React.useContext(GlobalDataContext);

  const font = randomFont?.family ?? null;

  return (
    <Box
      onClick={() => changeRandomFont()}
      sx={{
        width: "50px",
        height: "50px",
        cursor: "pointer",
        justifyItems: "center",
        alignContent: "center",
      }}
    >
      <HtmlTooltip
        title={
          <Stack alignItems={"center"}>
            <Typography fontFamily={font}>{font}</Typography>
            <Typography>{`${font}`}</Typography>
          </Stack>
        }
      >
        <Typography
          sx={{
            fontSize: "2rem",
            fontFamily: font,
            userSelect: "none",
          }}
        >
          B
        </Typography>
      </HtmlTooltip>
    </Box>
  );
};
