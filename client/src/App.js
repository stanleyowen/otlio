import React from 'react';
import "./App.css";
import { BrowserRouter as Router, Route } from 'react-router-dom';

import "@fortawesome/fontawesome-free/css/all.css";
import Landing from './components/landing.components';
import Register from './components/register.components';
import Footer from './components/footer.components';
import Dashboard from './components/todo.components';
import AddExercise from './components/add-todo.components';

function App() {
  return (
    <Router>
      <Route path='/' exact component={Landing} />
      <Route path='/register' component={Register} />
      <Route path='/dashboard' component={Dashboard} />
      <Route path='/add' component={AddExercise} />
      <Footer />
    </Router>
  );
}

export default App;