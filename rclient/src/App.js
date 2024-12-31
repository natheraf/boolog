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

export const ThemeContext = React.createContext({
  toggleColorMode: () => {},
  toggleReduceMotion: () => {},
});

function App() {
  const [mode, setMode] = React.useState(
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );
  const [reduceMotion, setReduceMotion] = React.useState(
    localStorage.getItem("reduceMotion") === "false" ? false : true
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
        setReduceMotion((prev) => !prev);
        localStorage.setItem("reduceMotion", !reduceMotion);
      },
    }),
    []
  );

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
          reduceMotion: reduceMotion,
        },
      }),
    [mode, reduceMotion]
  );

  return (
    <ThemeContext.Provider value={themeModes}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Wrappers>
            <Header />
            <Container maxWidth="xl" sx={{ mt: "88px" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="login">
                  <Route path="" element={<Login />} />
                  <Route
                    path="verify-email-directions"
                    element={<VerifyEmailDirections />}
                  />
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
