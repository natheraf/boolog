import { Box, Paper, Stack, Typography } from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { UserInfoContext } from "../../context/UserInfo";
import { AlertsContext } from "../../context/Alerts";

export const VerifyEmailDirections = () => {
  const navigate = useNavigate();
  const addAlert = React.useContext(AlertsContext).addAlert;
  const userInfoContext = React.useContext(UserInfoContext);

  React.useEffect(() => {
    if (userInfoContext.isLoggedIn()) {
      navigate("/");
      return;
    }
    let intervalId = null;
    const checkIfLoggedIn = () => {
      if (intervalId !== null && userInfoContext.refreshAndIsLoggedIn()) {
        clearInterval(intervalId);
        addAlert(
          "Login successful on another tab. Closing this one in 5 seconds.",
          "info"
        );
        setTimeout(() => {
          window.open("about:blank", "_self");
          window.close();
        }, 5000);
      }
    };
    intervalId = setInterval(checkIfLoggedIn, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Verify Email Directions</Typography>
      <Paper sx={{ p: "2rem" }}>
        <Stack>
          <Typography variant="h6">
            <ol>
              <li>Open your email client.</li>
              <li>
                Look for our email we sent. Could take up to a minute to arrive.
                Check your spam or junk folder as well.
              </li>
              <li>Once found, open our email.</li>
              <li>Click on "Click here to Login".</li>
              <li>Once logged in, please close or refresh this page.</li>
            </ol>
          </Typography>
          <Box
            component="img"
            src={require("../../assets/passwordless_email.jpg")}
            sx={{ marginLeft: 2.3, maxWidth: "800px" }}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};
