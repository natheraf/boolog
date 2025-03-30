import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertsContext } from "../../context/Alerts";
import { UserInfoContext } from "../../context/UserInfo";
import { handleSimpleRequest } from "../../api/Axios";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { getGoogleSignInWithDriveURL } from "../../api/GoogleAPI";

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

  const handleLogin = () =>
    handleSimpleRequest(
      "post",
      {
        code,
      },
      "auth/google/signin"
    )
      .then((res) => {
        addAlert(res.data.message, "info");
        userInfoContext.refreshAndIsLoggedIn();
      })
      .catch((error) => {
        addAlert(error.toString(), "error");
        navigate("/login");
      })
      .finally(() => (window.location.href = "/"));

  const handleGoogleSignInWithDriveClick = () => {
    getGoogleSignInWithDriveURL().then((signInURL) =>
      window.open(signInURL, "_self")
    );
  };

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
    const warnNoDriveScope = scope.includes(googleDriveScope) === false;
    if (!warnNoDriveScope) {
      handleLogin();
    }
    setWarnDriveScope(scope.includes(googleDriveScope) === false);
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
      <Paper component={Stack} sx={{ padding: 1 }} spacing={2}>
        <Typography variant="h4">No Google Drive access found!</Typography>
        <Typography variant="h6">
          No Drive access would mean your files will not be syncing across
          devices and are not backed up! If this was unintended, please try
          logging in again with this checked.
        </Typography>
        <Box
          component="img"
          src={require("../../assets/enable_drive_access.png")}
          sx={{ marginLeft: 2.3, maxWidth: "600px" }}
        />
        <Typography variant="h6">
          {
            "With Drive access, Boolog will not have access of any kind to any files not managed by Boolog. All files managed by Boolog will be in "
          }
          <Typography
            sx={{
              fontSize: "inherit",
              backgroundColor: "rgba(80, 80, 80, .5)",
              fontFamily: "monospace",
            }}
            component={"span"}
          >
            appdata/boolog
          </Typography>
          .
        </Typography>
        <Typography variant="h6">
          If you are still worried or do not think your Drive has enough space,
          feel free to{" "}
          <Typography
            component={"a"}
            onClick={() =>
              window.open(
                "https://support.google.com/accounts/answer/27441?hl=en&sjid=16597296022837484796-NA",
                "_blank"
              )
            }
            sx={{
              fontSize: "inherit",
              textDecoration: "none",
              color: "skyblue",
              cursor: "pointer",
            }}
          >
            create another Google account
          </Typography>{" "}
          just to use with Boolog. Access can be{" "}
          <Typography
            component={"a"}
            onClick={() =>
              window.open(
                "https://support.google.com/accounts/answer/13533235?hl=en",
                "_blank"
              )
            }
            sx={{
              fontSize: "inherit",
              textDecoration: "none",
              color: "skyblue",
              cursor: "pointer",
            }}
          >
            revoked
          </Typography>{" "}
          at any time. Everything stored can be seen by you.
        </Typography>
        <Typography>
          You can always enable Drive access whenever you login.
        </Typography>
        <Typography>If intended, feel free to continue.</Typography>
        <Stack alignSelf={"end"} spacing={2} direction={"row"}>
          <Button onClick={handleLogin} variant="outlined" color="warning">
            Continue without Drive
          </Button>
          <Button
            variant="contained"
            onClick={handleGoogleSignInWithDriveClick}
          >
            Login again
          </Button>
        </Stack>
      </Paper>
    </Stack>
  ) : (
    <Typography>Redirecting...</Typography>
  );
};
