import React from 'react';
import "./App.css";
import { BrowserRouter as Router, Route } from 'react-router-dom';

import "@fortawesome/fontawesome-free/css/all.css";
import Navbar from './components/navbar.components';
import Welcome from './components/welcome.components';
import Register from './components/register.components';
import Login from './components/login.components';
import Home from './components/home.components';
import EditTodo from './components/edit.components';

function App() {
  return (
    <Router>
      <Navbar />
      <Route path='/' exact component={Home} />
      <Route path='/welcome' component={Welcome} />
      <Route path='/get-started' component={Register} />
      <Route path='/login' component={Login} />
      <Route path='/edit/:id' component={EditTodo} />
    </Router>
  );
}

export default App;