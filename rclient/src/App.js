import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import * as React from "react";

import { Login } from "./views/login/Login";
import { SearchBook } from "./views/SearchBook";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Header } from "./components/Header";
import { Home } from "./views/Home";
import { BookLog } from "./views/BookLog";
import { Passwordless } from "./views/login/Passwordless";
import { Wrappers } from "./context/Wrappers";
import { VerifyEmailDirections } from "./views/login/VerifyEmailDirections";
import { Upload } from "./views/Upload";
import { PrivacyPolicy } from "./views/legal/PrivacyPolicy";
import { TermsOfService } from "./views/legal/TermsOfService";
import { GoogleAuth } from "./views/login/GoogleAuth";

export const ThemeContext = React.createContext({
  toggleColorMode: () => {},
  toggleReduceMotion: () => {},
});

function App() {
  const [mode, setMode] = React.useState(
    localStorage.getItem("theme") === "light" ? "light" : "dark"
  );
  const [reduceMotion, setReduceMotion] = React.useState(
    (localStorage.getItem("reduceMotion") ?? "false") !== "false"
  );

  const themeModes = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("theme", newMode);
          return newMode;
        });
      },
      toggleReduceMotion: () => {
        setReduceMotion((prev) => {
          localStorage.setItem("reduceMotion", !prev);
          return !prev;
        });
      },
    }),
    []
  );

  const reduceMotionValue = +!reduceMotion;
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          inputAdornment: {
            disabled: mode === "light" ? "lightgray" : "gray",
            enabled: mode === "light" ? "gray" : "lightgray",
          },
        },
        transitions: {
          reduceMotion: !reduceMotion,
          duration: {
            shortest: 150 * reduceMotionValue,
            shorter: 200 * reduceMotionValue,
            short: 250 * reduceMotionValue,
            standard: 300 * reduceMotionValue,
            complex: 375 * reduceMotionValue,
            enteringScreen: 225 * reduceMotionValue,
            leavingScreen: 195 * reduceMotionValue,
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: reduceMotion
                ? {
                    transition: "none !important",
                  }
                : {},
            },
          },
        },
      }),
    [mode, reduceMotion]
  );

  React.useEffect(() => {
    document.cookie =
      "g_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, []);

  return (
    <ThemeContext.Provider value={themeModes}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Wrappers>
            <Header />
            <Container maxWidth="xl" sx={{ mt: "10px" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="login">
                  <Route path="" element={<Login />} />
                  <Route
                    path="verify-email-directions"
                    element={<VerifyEmailDirections />}
                  />
                  <Route path="google-auth" element={<GoogleAuth />} />
                  <Route path="passwordless" element={<Passwordless />} />
                </Route>
                <Route path="books">
                  <Route path="" element={<BookLog />} />
                  <Route path="search" element={<SearchBook />} />
                </Route>
                <Route path="*" element={<h1>Wrong path</h1>} />
              </Routes>
            </Container>
          </Wrappers>
        </Router>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
