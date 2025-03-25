import * as React from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Fade,
  Grow,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import bgImage from "../../assets/authentication_bg_med.jpg";
import { getRandomWord, handleSimpleRequest } from "../../api/Axios";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { AlertsContext } from "../../context/Alerts";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { UserInfoContext } from "../../context/UserInfo";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import GoogleIcon from "@mui/icons-material/Google";
import { getGoogleSignInWithDriveURL } from "../../api/GoogleAPI";

function decodeJwtResponse(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const addAlert = React.useContext(AlertsContext).addAlert;
  const userInfoContext = React.useContext(UserInfoContext);
  const [showLogin, setShowLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [controlled, setControlled] = React.useState({});
  const [canSubmitTop, setCanSubmitTop] = React.useState(false);
  const [canSubmitBottom, setCanSubmitBottom] = React.useState(false);
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

  const keyPress = (event) => {
    const enterKey = 13;
    if (event.keyCode === enterKey) {
      if (canSubmitBottom) {
        handlePasswordlessLogin();
      }
      if (canSubmitTop) {
        showLogin ? handleLogin() : handleSignup();
      }
    }
  };

  const handleControlledOnChange = (key) => (event, value) => {
    if (key === "showPassword") {
      setControlled((prev) => ({ ...prev, [key]: !prev[key] }));
    } else {
      setControlled((prev) => ({
        ...prev,
        [key]: event?.target?.value ?? value,
      }));
    }
  };

  const generateRandomPassword = () => {
    const numberOfWords = 3;
    const minLength = 4;
    const maxLength = 6;
    const specialCharacters = "!@#$%^&*";
    getRandomWord(numberOfWords, minLength, maxLength).then((words) => {
      words = words.map((word) => word[0].toUpperCase() + word.substring(1));
      const randomNumberPosition = Math.floor(Math.random() * numberOfWords);
      words[randomNumberPosition] += Math.floor(Math.random() * 10);
      const joinedResult =
        words.join("-") +
        specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
      navigator.clipboard.writeText(joinedResult);
      addAlert("Generated password copied to clipboard", "info");
      setControlled((prev) => ({
        ...prev,
        loginPassword: joinedResult,
        signupConfirmPassword: joinedResult,
      }));
    });
  };

  const handleMouseChange = (event) => {
    event.preventDefault();
  };

  const handlePasswordlessLogin = () => {
    setLoading(true);
    handleSimpleRequest(
      "post",
      {
        email: document.getElementById("passwordlessEmail").value,
        active: true,
      },
      "auth/passwordless/sendcode"
    )
      .then((res) => {
        addAlert(res.data.message, "success");
        navigate("verify-email-directions");
      })
      .catch((error) => {
        console.log(error);
        addAlert(error.toString(), "error");
      })
      .finally(() => setLoading(false));
  };

  const handleLogin = () => {
    setLoading(true);
    handleSimpleRequest(
      "post",
      {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
      },
      "auth/signin"
    )
      .then((res) => {
        addAlert(res.data.message, "info");
        userInfoContext.refreshAndIsLoggedIn().then(() => navigate("/"));
      })
      .catch((error) => addAlert(error.toString(), "error"))
      .finally(() => setLoading(false));
  };

  const handleSignup = () => {
    if (
      document.getElementById("loginPassword").value !==
      document.getElementById("signupConfirmPassword").value
    ) {
      window.alert("Passwords do not match");
      return;
    }
    setLoading(true);
    handleSimpleRequest(
      "post",
      {
        name: document.getElementById("signupName").value,
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
        active: true,
      },
      "auth/signup"
    )
      .then((res) => {
        addAlert(res.data.message, "info");
        navigate("verify-email-directions");
      })
      .catch((error) => addAlert(error.toString(), "error"))
      .finally(() => setLoading(false));
  };

  const handleGoogleSignInWithDriveClick = () => {
    getGoogleSignInWithDriveURL().then((signInURL) =>
      window.open(signInURL, "_self")
    );
  };

  const handleGoogleSignInWithDrive = () => {};

  const handleGoogleSignInWithoutDrive = (response) => {
    const responsePayload = decodeJwtResponse(response.credential);
    console.log(responsePayload);
  };

  window.handleCredentialResponse = handleGoogleSignInWithoutDrive;

  React.useEffect(() => {
    userInfoContext.refreshAndIsLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) navigate("/");
    });
    const googleScript = document.createElement("script");
    googleScript.src = "https://accounts.google.com/gsi/client";
    googleScript.async = true;
    googleScript.id = "google-script";
    document.head.insertAdjacentElement("afterbegin", googleScript);
    return () => {
      window.google?.accounts.id.cancel();
      document.getElementById("google-script")?.remove();
    };
  }, []);

  return (
    <Box>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
          overflow: "hidden",
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
        }}
      />
      <Grow in={true}>
        <Paper
          sx={{
            borderRadius: "10px",
            padding: "3rem",
            width: { xs: "auto", sm: "450px" },
            marginBottom: 1,
          }}
        >
          <Stack spacing={3}>
            <Stack
              spacing={2}
              direction="column"
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Fade
                in={showLogin}
                timeout={1000 * theme.transitions.reduceMotion}
                sx={!showLogin ? { display: "none" } : {}}
              >
                <Typography variant="h4">Sign in</Typography>
              </Fade>
              <Stack
                spacing={1}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Typography sx={{ textAlign: "center" }}>
                  Continue with Google + Google Drive Integration
                </Typography>
                <Box sx={{ position: "relative" }}>
                  <Box
                    onClick={handleGoogleSignInWithDriveClick}
                    sx={{
                      position: "absolute",
                      opacity: 0,
                      width: 260,
                      height: 50,
                      left: -10,
                      top: -4,
                      zIndex: 1,
                      cursor: "pointer",
                    }}
                  />
                  <div
                    className="g_id_signin"
                    data-type="standard"
                    data-shape="rectangular"
                    data-theme="filled_blue"
                    data-text="signin_with"
                    data-size="large"
                    data-logo_alignment="left"
                  />
                </Box>
              </Stack>
              <Divider>
                <Typography color="gray">or</Typography>
              </Divider>
              <Fade
                in={!showLogin}
                timeout={1000 * theme.transitions.reduceMotion}
                sx={showLogin ? { display: "none" } : {}}
              >
                <Typography variant="h4">Sign up</Typography>
              </Fade>
              <Collapse
                timeout={500 * theme.transitions.reduceMotion}
                in={!showLogin}
                sx={{ width: "100%" }}
              >
                <TextField
                  id="signupName"
                  label="Username"
                  fullWidth
                  onFocus={() => setCanSubmitTop(true)}
                  onBlur={() => setCanSubmitTop(false)}
                  onKeyDown={keyPress}
                  InputProps={
                    greaterThanSmall
                      ? {
                          endAdornment: (
                            <InputAdornment position="end">
                              <PersonIcon
                                sx={{
                                  color: theme.palette.inputAdornment.disabled,
                                }}
                              />
                            </InputAdornment>
                          ),
                        }
                      : {}
                  }
                />
              </Collapse>
              <TextField
                id="loginEmail"
                label="Email"
                type="email"
                fullWidth
                onFocus={() => setCanSubmitTop(true)}
                onBlur={() => setCanSubmitTop(false)}
                onKeyDown={keyPress}
                value={controlled.email || ""}
                onChange={handleControlledOnChange("email")}
                InputProps={
                  greaterThanSmall
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <EmailIcon
                              sx={{
                                color: theme.palette.inputAdornment.disabled,
                              }}
                            />
                          </InputAdornment>
                        ),
                      }
                    : {}
                }
              />
              <TextField
                id="loginPassword"
                label="Password"
                type={controlled.showPassword ? "text" : "password"}
                fullWidth
                onFocus={() => setCanSubmitTop(true)}
                onBlur={() => setCanSubmitTop(false)}
                onKeyDown={keyPress}
                value={controlled.loginPassword || ""}
                onChange={handleControlledOnChange("loginPassword")}
                InputProps={{
                  endAdornment: showLogin ? (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          controlled.showPassword
                            ? "Hide Password"
                            : "Show Password"
                        }
                      >
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleControlledOnChange("showPassword")}
                          // onMouseDown={handleMouseChange}
                          // onMouseUp={handleMouseChange}
                          sx={{
                            mr: -1,
                            color: theme.palette.inputAdornment.enabled,
                          }}
                        >
                          {controlled.showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : (
                    <InputAdornment position="end">
                      <Tooltip title="Random Password">
                        <IconButton
                          aria-label="generate random password"
                          onClick={() => generateRandomPassword(16)}
                          sx={{
                            mr: -1,
                            color: theme.palette.inputAdornment.enabled,
                          }}
                        >
                          <ShuffleIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <Collapse
                timeout={500 * theme.transitions.reduceMotion}
                in={!showLogin}
                sx={{ width: "100%" }}
              >
                <TextField
                  id="signupConfirmPassword"
                  label="Confirm Password"
                  type={controlled.showPassword ? "text" : "password"}
                  fullWidth
                  onFocus={() => setCanSubmitTop(true)}
                  onBlur={() => setCanSubmitTop(false)}
                  onKeyDown={keyPress}
                  value={controlled.signupConfirmPassword || ""}
                  onChange={handleControlledOnChange("signupConfirmPassword")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={
                            controlled.showPassword
                              ? "Hide Password"
                              : "Show Password"
                          }
                        >
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleControlledOnChange("showPassword")}
                            sx={{
                              mr: -1,
                              color: theme.palette.inputAdornment.enabled,
                            }}
                          >
                            {controlled.showPassword ? (
                              <VisibilityOff />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Collapse>
              <Fade
                in={showLogin}
                sx={!showLogin ? { display: "none" } : { width: "100%" }}
              >
                <Stack spacing={2}>
                  <Button
                    onClick={handleLogin}
                    variant="contained"
                    fullWidth
                    endIcon={
                      loading ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : canSubmitTop ? (
                        <KeyboardReturnIcon />
                      ) : null
                    }
                    disabled={loading}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowLogin((prev) => !prev)}
                    disabled={loading}
                  >
                    Sign Up
                  </Button>
                </Stack>
              </Fade>
              <Fade
                in={!showLogin}
                sx={showLogin ? { display: "none" } : { width: "100%" }}
              >
                <Stack spacing={2}>
                  <Button
                    onClick={handleSignup}
                    variant="contained"
                    endIcon={
                      loading ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : canSubmitTop ? (
                        <KeyboardReturnIcon />
                      ) : null
                    }
                    disabled={loading}
                  >
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => setShowLogin((prev) => !prev)}
                    disabled={loading}
                  >
                    Sign In
                  </Button>
                </Stack>
              </Fade>
            </Stack>
            <Divider>
              <Typography color="gray">or</Typography>
            </Divider>
            <Stack
              spacing={2}
              direction="column"
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Fade in={true}>
                <Stack spacing={3} width="100%">
                  <Stack
                    direction="column"
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <Typography variant="h6">
                      Passwordless with Email
                    </Typography>
                    <Typography variant="subtitle2" color="gray">
                      No Sign up Necessary
                    </Typography>
                  </Stack>
                  <TextField
                    id="passwordlessEmail"
                    label="Email"
                    type="email"
                    fullWidth
                    onFocus={() => setCanSubmitBottom(true)}
                    onBlur={() => setCanSubmitBottom(false)}
                    onKeyDown={keyPress}
                    value={controlled.email || ""}
                    onChange={handleControlledOnChange("email")}
                    InputProps={
                      greaterThanSmall
                        ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <EmailIcon
                                  sx={{
                                    color:
                                      theme.palette.inputAdornment.disabled,
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }
                        : {}
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={handlePasswordlessLogin}
                    endIcon={
                      loading ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : canSubmitBottom ? (
                        <KeyboardReturnIcon />
                      ) : null
                    }
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Loading..." : "Send Link"}
                  </Button>
                </Stack>
              </Fade>
            </Stack>
            <Divider>
              <Typography color="gray">or</Typography>
            </Divider>
            <Stack justifyContent={"center"} alignItems={"center"}>
              <div
                id="g_id_onload"
                data-client_id="1006864146530-vr0rvajagjoomnkidutg8oiaqupl6odm.apps.googleusercontent.com"
                data-auto_prompt="false"
                data-context="use"
                data-ux_mode="popup"
                data-callback={"handleCredentialResponse"}
                data-itp_support="true"
                data-cancel_on_tap_outside="true"
              />
              <div
                className="g_id_signin"
                data-type="standard"
                data-shape="rectangular"
                data-theme="filled_blue"
                data-text="signin_with"
                data-size="large"
                data-logo_alignment="left"
              />
            </Stack>
          </Stack>
        </Paper>
      </Grow>
    </Box>
  );
};
