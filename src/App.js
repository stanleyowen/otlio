import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import "@fortawesome/fontawesome-free/css/all.css";
import Landing from './components/landing.components';
import Register from './components/register.components';
import Footer from './components/footer.components';
function App() {
  return (
    <Router>
      <Route path='/' exact component={Landing} />
      <Route path='/register' component={Register} />
      <Footer />
    </Router>
  );
}

export default App;