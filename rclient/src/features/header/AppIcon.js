import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { GlobalDataContext } from "../context/GlobalData";
import { HtmlTooltip, RandomFontTypography } from "../CustomComponents";

export const AppIcon = () => {
  const { changeRandomFont } = React.useContext(GlobalDataContext);

  return (
    <Box
      onClick={() => changeRandomFont()}
      sx={{
        width: "50px",
        height: "50px",
        cursor: "pointer",
        justifyItems: "center",
        alignContent: "center",
        textAlign: "center",
      }}
    >
      <RandomFontTypography fontSize={"2rem"} variant={null}>
        B
      </RandomFontTypography>
    </Box>
  );
};
