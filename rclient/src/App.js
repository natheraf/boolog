import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import * as React from "react";

import { Login } from "./views/Login";
import { SearchBook } from "./views/SearchBook";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

function App() {
  const [mode, setMode] = React.useState(
    localStorage.getItem("darkMode") === undefined ||
      localStorage.getItem("darkMode") === "light"
      ? "light"
      : "dark"
  );

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          localStorage.setItem(
            "darkMode",
            prevMode === "light" ? "dark" : "light"
          );
          return prevMode === "light" ? "dark" : "light";
        });
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
        },
      }),
    []
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Container maxWidth="xl" sx={{ mt: "88px" }}>
            <Routes>
              <Route path="" element={<h1>Home</h1>} />
              <Route path="*" element={<h1>Wrong path</h1>} />
              <Route path="login" element={<Login />} />
              <Route path="loggedIn" element={<h1>Logged In</h1>} />
              <Route path="searchBook" element={<SearchBook />} />
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
