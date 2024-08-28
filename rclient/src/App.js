import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import * as React from "react";

import { Login } from "./views/Login";
import { SearchBook } from "./views/SearchBook";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Header } from "./components/Header";
import { Home } from "./views/Home";
import { BookLog } from "./views/BookLog";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

function App() {
  const [mode, setMode] = React.useState(
    localStorage.getItem("darkMode") === "dark" ? "dark" : "light"
  );

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem("darkMode", newMode);
          return newMode;
        });
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
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
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
    </ColorModeContext.Provider>
  );
}

export default App;
