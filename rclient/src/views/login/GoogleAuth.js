import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertsContext } from "../../context/Alerts";
import { UserInfoContext } from "../../context/UserInfo";
import { handleSimpleRequest } from "../../api/Axios";
import { Box, Paper, Stack, Typography } from "@mui/material";

export const GoogleAuth = () => {
  const addAlert = React.useContext(AlertsContext).addAlert;
  const navigate = useNavigate();
  const userInfoContext = React.useContext(UserInfoContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const scope = searchParams.get("scope");
  const error = searchParams.get("error");
  const googleDriveScope = "https://www.googleapis.com/auth/drive.file";
  const [warnDriveScope, setWarnDriveScope] = React.useState(false);
  const handlePasswordlessLogin = () => {
    if (error || !code || !scope) {
      let alertMessage = error;
      if (error === "access_denied") {
        alertMessage = "Access denied";
      } else if (!code || !scope) {
        alertMessage = "Missing login";
      }
      addAlert(alertMessage, "error");
      return navigate("/login");
    }
    setWarnDriveScope(scope.includes(googleDriveScope) === false);
    handleSimpleRequest(
      "post",
      {
        code,
      },
      "auth/google/get-token"
    )
      .then((res) => {
        console.log(res.data);
        // addAlert(res.data.message, "info");
        // userInfoContext.refreshAndIsLoggedIn();
      })
      .catch((error) => addAlert(error.toString(), "error"));
    // .finally(() => (window.location.href = "/"));
  };

  // Timeout is there to stop strict mode from calling function twice
  React.useEffect(() => {
    const timeoutId = setTimeout(handlePasswordlessLogin, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return warnDriveScope ? (
    <Stack
      sx={{
        width: "100%",
      }}
    >
      <Paper component={Stack} sx={{ padding: 1 }}>
        <Typography variant="h4">No Google Drive permissions found</Typography>
        <br />
        <Typography variant="h6">
          No Drive permissions would mean your files will not be syncing across
          devices! If this was intended, feel free to continue. If not, try
          logging in again.
        </Typography>
      </Paper>
    </Stack>
  ) : (
    <Typography>Found Drive permissions</Typography>
  );
};
