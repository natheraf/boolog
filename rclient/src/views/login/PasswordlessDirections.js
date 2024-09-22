import { Box, Paper, Stack, Typography } from "@mui/material";

export const PasswordlessDirections = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Passwordless Directions</Typography>
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
