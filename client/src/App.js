import React from 'react';
import "./App.min.css";
import { BrowserRouter as Router, Route } from 'react-router-dom';

import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from './components/navbar.component';
import Welcome from './components/welcome.component';
import Register from './components/register.component';
import Login from './components/login.component';
import Home from './components/home.component';
import EditTodo from './components/edit.component';

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