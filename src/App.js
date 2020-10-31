import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import "@fortawesome/fontawesome-free/css/all.css";
import Landing from './components/landing.components';

function App() {
  return (
    <Router>
      <Route path='/' exact component={Landing} />
    </Router>
  );
}

export default App;