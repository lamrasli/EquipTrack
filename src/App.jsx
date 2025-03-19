import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import MainApp from "./MainApp"; // Importez le composant MainApp

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;