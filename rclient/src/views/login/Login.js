import * as React from "react";
import {
  Button,
  Collapse,
  Divider,
  Fade,
  Grow,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import bgImage from "../../assets/authentication_bg_med.jpg";
import { handleSimpleRequest } from "../../api/Axios";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

export const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

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
        navigate("/");
      })
      .catch((error) => console.log(error));
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
        navigate("/");
      })
      .catch((error) => console.log(error));
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
                  <TextField id="signupName" label="Username" fullWidth />
                </Collapse>
                <TextField
                  id="loginEmail"
                  label="Email"
                  type="email"
                  fullWidth
                />
                <TextField
                  id="loginPassword"
                  label="Password"
                  type="password"
                  fullWidth
                />
                <Collapse
                  timeout={500 * theme.transitions.reduceMotion}
                  in={!showLogin}
                  sx={{ width: "100%" }}
                >
                  <TextField
                    id="signupConfirmPassword"
                    label="Confirm Password"
                    type="password"
                    fullWidth
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
