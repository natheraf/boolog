import * as React from "react";
import {
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
  Typography,
  useMediaQuery,
} from "@mui/material";
import bgImage from "../../assets/authentication_bg_med.jpg";
import { handleSimpleRequest } from "../../api/Axios";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { AlertContext } from "../../components/AlertWrapper";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import ShuffleIcon from "@mui/icons-material/Shuffle";

export const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const alertContext = React.useContext(AlertContext);
  const addAlert = alertContext.addAlert;
  const [showLogin, setShowLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [controlled, setControlled] = React.useState({});
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

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

  const generateRandomPassword = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-";
    const res = [];
    while (res.length < length) {
      res.push(characters[Math.floor(Math.random() * characters.length)]);
    }
    setControlled((prev) => ({
      ...prev,
      loginPassword: res.join(""),
      signupConfirmPassword: res.join(""),
      showPassword: true,
    }));
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
        console.log(res.data.message);
        navigate("passwordless-directions");
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  const handleLogin = () => {
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
        navigate("/");
      })
      .catch((error) => addAlert(error.toString(), "error"));
  };

  const handleSignup = () => {
    if (
      document.getElementById("loginPassword").value !==
      document.getElementById("signupConfirmPassword").value
    ) {
      window.alert("Passwords do not match");
      return;
    }
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
        addAlert("Successfully created account", "info");
        addAlert(res.data.message, "info");
        navigate("/");
      })
      .catch((error) => addAlert(error.toString(), "error"));
  };

  return (
    <Stack
      sx={{
        position: "absolute",
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
    >
      <Stack
        direction="column"
        alignItems={"center"}
        justifyContent={"center"}
        height="100%"
      >
        <Grow in={true} timeout={theme.transitions.reduceMotion ? "auto" : 0}>
          <Paper
            sx={{
              borderRadius: "10px",
              padding: "3rem",
              width: { xs: "auto", sm: "450px" },
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
                  timeout={2000 * theme.transitions.reduceMotion}
                  sx={!showLogin ? { display: "none" } : {}}
                >
                  <Typography variant="h4">Sign in</Typography>
                </Fade>
                <Fade
                  in={!showLogin}
                  timeout={2000 * theme.transitions.reduceMotion}
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
                    InputProps={
                      greaterThanSmall
                        ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <PersonIcon sx={{ color: "gray" }} />
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
                  value={controlled.email || ""}
                  onChange={handleControlledOnChange("email")}
                  InputProps={
                    greaterThanSmall
                      ? {
                          endAdornment: (
                            <InputAdornment position="end">
                              <EmailIcon sx={{ color: "gray" }} />
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
                  value={controlled.loginPassword || ""}
                  onChange={handleControlledOnChange("loginPassword")}
                  InputProps={{
                    endAdornment: showLogin ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleControlledOnChange("showPassword")}
                          // onMouseDown={handleMouseChange}
                          // onMouseUp={handleMouseChange}
                          sx={{ mr: -1 }}
                        >
                          {controlled.showPassword ? (
                            <VisibilityOff sx={{ color: "lightgray" }} />
                          ) : (
                            <VisibilityIcon sx={{ color: "lightgray" }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ) : (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="generate random password"
                          onClick={() => generateRandomPassword(16)}
                          sx={{ mr: -1 }}
                        >
                          <ShuffleIcon />
                        </IconButton>
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
                    value={controlled.signupConfirmPassword || ""}
                    onChange={handleControlledOnChange("signupConfirmPassword")}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleControlledOnChange("showPassword")}
                            sx={{ mr: -1 }}
                          >
                            {controlled.showPassword ? (
                              <VisibilityOff sx={{ color: "lightgray" }} />
                            ) : (
                              <VisibilityIcon sx={{ color: "lightgray" }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Collapse>
                <Fade
                  in={showLogin}
                  timeout={2000 * theme.transitions.reduceMotion}
                  sx={!showLogin ? { display: "none" } : { width: "100%" }}
                >
                  <Stack spacing={2}>
                    <Button onClick={handleLogin} variant="contained" fullWidth>
                      Sign In
                    </Button>
                    <Button onClick={() => setShowLogin((prev) => !prev)}>
                      Sign Up
                    </Button>
                  </Stack>
                </Fade>
                <Fade
                  in={!showLogin}
                  timeout={2000 * theme.transitions.reduceMotion}
                  sx={showLogin ? { display: "none" } : { width: "100%" }}
                >
                  <Stack spacing={2}>
                    <Button onClick={handleSignup} variant="contained">
                      Sign Up
                    </Button>
                    <Button onClick={() => setShowLogin((prev) => !prev)}>
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
                <Fade in={true} timeout={2000 * theme.transitions.reduceMotion}>
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
                      value={controlled.email || ""}
                      onChange={handleControlledOnChange("email")}
                      InputProps={
                        greaterThanSmall
                          ? {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <EmailIcon sx={{ color: "gray" }} />
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
            </Stack>
          </Paper>
        </Grow>
      </Stack>
    </Stack>
  );
};
