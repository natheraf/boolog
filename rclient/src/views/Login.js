import * as React from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import bgImage from "../assets/authentication_bg_med.jpg";
import { handleSimpleRequest } from "../api/Axios";

export const Login = () => {
  const [showLogin, setShowLogin] = React.useState(true);
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
        console.log(res);
        window.location.href = `${window.location.protocol}//${window.location.hostname}:3000/loggedin`;
      })
      .catch((error) => console.log(error));
  };

  const handleSignup = () => {
    if (
      document.getElementById("signupPassword").value !==
      document.getElementById("signupConfirmPassword").value
    ) {
      window.alert("Passwords do not match");
      return;
    }
    handleSimpleRequest(
      "post",
      {
        name: document.getElementById("signupName").value,
        email: document.getElementById("signupEmail").value,
        password: document.getElementById("signupPassword").value,
        active: true,
      },
      "auth/signup"
    )
      .then((res) => {
        console.log(res);
        window.location.href = `${window.location.protocol}//${window.location.hostname}:3000/`;
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
        spacing={4}
        height="100%"
      >
        {showLogin ? (
          <Stack
            spacing={2}
            direction="column"
            alignItems={"center"}
            justifyContent={"center"}
            sx={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "3rem",
              width: "300px",
            }}
          >
            <Typography variant="h4">Sign in</Typography>
            <TextField id="loginEmail" label="Email" type="email" fullWidth />
            <TextField
              id="loginPassword"
              label="Password"
              type="password"
              fullWidth
            />
            <Button onClick={handleLogin} variant="contained" fullWidth>
              Sign In
            </Button>
            <Button onClick={() => setShowLogin((prev) => !prev)}>
              Sign Up
            </Button>
          </Stack>
        ) : (
          <Stack
            spacing={2}
            direction="column"
            alignItems={"center"}
            justifyContent={"center"}
            sx={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "3rem",
              width: "300px",
            }}
          >
            <Typography variant="h4">Sign up</Typography>
            <TextField id="signupName" label="Username" fullWidth />
            <TextField id="signupEmail" label="Email" type="email" fullWidth />
            <TextField
              id="signupPassword"
              label="Password"
              type="password"
              fullWidth
            />
            <TextField
              id="signupConfirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
            />
            <Button onClick={handleSignup} variant="contained" fullWidth>
              Sign Up
            </Button>
            <Button onClick={() => setShowLogin((prev) => !prev)}>
              Sign In
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
