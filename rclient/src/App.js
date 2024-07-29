import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import * as React from "react";

import { Login } from "./views/Login";
import { SearchBook } from "./views/SearchBook";

function App() {
  return (
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
  );
}

export default App;
