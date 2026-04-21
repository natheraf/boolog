import { Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { GlobalDataContext } from "../context/GlobalData";
import { RandomFontTypography } from "../CustomComponents";

export const LandingPage = () => {
  const { changeRandomFont } = React.useContext(GlobalDataContext);

  return (
    <Stack>
      <Stack
        component={Paper}
        onClick={() => changeRandomFont()}
        sx={{ width: "100%", height: "90vh", cursor: "pointer" }}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <RandomFontTypography fontSize={null} variant={"h1"}>
          {"Boolog"}
        </RandomFontTypography>
      </Stack>
      <Stack sx={{ width: "100%", height: "90vh", cursor: "pointer" }}></Stack>
    </Stack>
  );
};
