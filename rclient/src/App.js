import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import * as React from "react";

import "./App.css";

function App() {
  return (
    <Router>
      <Container maxWidth="xl" sx={{ mt: "88px" }}>
        <Routes>
          <Route path="" element={<h1>Home</h1>} />
          <Route path="*" element={<h1>Wrong path</h1>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
