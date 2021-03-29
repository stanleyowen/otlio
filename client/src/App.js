import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';

import { createRequest } from './libraries/validation'
import { setWarning } from './libraries/setNotification';
import { setNotification, NOTIFICATION_TYPES } from './libraries/setNotification';
import "./App.min.css";

import Navbar from './components/navbar.component';
import Welcome from './components/welcome.component';
import Register from './components/register.component';
import Login from './components/login.component';
import ResetPassword from './components/reset-password.component';
import ForgetPassword from './components/forget-password.component';
import Home from './components/home.component';
import EditTodo from './components/edit.component';
import OAuth from './components/register-oauth.component';
import ReqOAuth from './components/req-oauth.component';
import Account from './components/account.component';

export default function App() {
  const [userData, setUserData] = useState({ isLoading: true });
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;
  const redirectRoute = ['welcome', 'login', 'get-started'];
  const privateRoute = ['', 'edit', 'account'];

  if(!userData.isLoading && userData.authenticated){
    redirectRoute.forEach(a => {
      if(window.location.pathname.split('/')[1] === a) window.location='/';
    });
  }else if(!userData.isLoading && !userData.authenticated){
    privateRoute.forEach(a => {
      if(window.location.pathname.split('/')[1] === a) window.location='/welcome';
    });
  }

  useEffect(() => {
    axios.get(`${SERVER_URL}/account/user`, {withCredentials: true})
    .then(res => {
      setUserData({
        isLoading: false,
        id: res.data.id,
        email: res.data.email,
        authenticated: res.data.authenticated,
        thirdParty: res.data.thirdParty
      })
    })
    .catch(err => {
      if(err.response.data.message && err.response.data.message !== "No auth token") setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
      setUserData({
        isLoading: false,
        authenticated: false
      })
    })
    createRequest();
    setWarning();
  },[SERVER_URL])

  return (
    <Router>
      <Navbar userData={userData} />
      <Route path='/' exact component={() => <Home userData={userData} />} />
      <Route path='/welcome' component={Welcome} />
      <Route path='/get-started' component={Register} />
      <Route path='/login' component={() => <Login userData={userData} />} />
      <Route path='/edit/:id' component={() => <EditTodo userData={userData} />} />
      <Route path='/oauth' component={ReqOAuth} />
      <Route path='/auth/:service/:email' component={OAuth} />
      <Route path='/account' component={() => <Account userData={userData} />} />
      <Route path='/forget-password' component={ForgetPassword} />
      <Route path='/reset-password' component={ResetPassword} />
    </Router>
  );
}