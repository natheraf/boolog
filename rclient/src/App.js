import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import * as React from "react";

import { Login } from "./views/Login";
import { SearchBook } from "./views/SearchBook";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Header } from "./components/Header";
import { Home } from "./views/Home";
import { BookLog } from "./views/BookLog";

export const ThemeContext = React.createContext({
  toggleColorMode: () => {},
  toggleReduceMotion: () => {},
});

function App() {
  const [mode, setMode] = React.useState(
    localStorage.getItem("darkMode") === "dark" ? "dark" : "light"
  );
  const [reduceMotion, setReduceMotion] = React.useState(
    localStorage.getItem("reduceMotion") === "false" ? false : true
  );

  const themeModes = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("darkMode", newMode);
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
          <Header />
          <Container maxWidth="xl" sx={{ mt: "88px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="loggedIn" element={<h1>Logged In</h1>} />
              <Route path="books">
                <Route path="" element={<BookLog />} />
                <Route path="search" element={<SearchBook />} />
              </Route>
              <Route path="*" element={<h1>Wrong path</h1>} />
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
