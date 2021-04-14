import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from './libraries/setNotification';
import "./App.css";

import Navbar from './components/navbar.component';
import Welcome from './components/welcome.component';
import Register from './components/register.component';
import Login from './components/login.component';
import ResetPassword from './components/reset-password.component';
import ReqResetPassword from './components/forgot-password.component';
import Home from './components/home.component';
import EditTodo from './components/edit.component';
import OAuth from './components/register-oauth.component';
import ReqOAuth from './components/req-oauth.component';
import Account from './components/account.component';
import PrivacyPolicy from './components/privacy-policy.component';
import TermsAndConditions from './components/terms-and-condition.component';
import VerifyAccount from './components/verify-account.component';

export default function App() {
  const [userData, setUserData] = useState({ isLoading: true });
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;
  const redirectRoute = ['welcome', 'login', 'get-started'];
  const privateRoute = ['', 'edit', 'account'];
  const info = JSON.parse(localStorage.getItem('info'));

  if(info && info.statusCode && info.message){
    const status = info.statusCode === 200 ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.DANGER;
    setNotification(status, info.message); localStorage.removeItem('info');
  }
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
    axios.get(`${SERVER_URL}/account/user`, { withCredentials: true })
    .then(res => {
      setUserData({
        isLoading: false,
        id: res.data.credentials.id,
        email: res.data.credentials.email,
        authenticated: res.data.credentials.authenticated,
        thirdParty: res.data.credentials.thirdParty,
        verified: res.data.credentials.verified
      })
      localStorage.setItem('XSRF-TOKEN', res.data['XSRF-TOKEN'])
    })
    .catch(err => {
      localStorage.setItem('XSRF-TOKEN', err.response.data['XSRF-TOKEN'])
      if(err.response.data.message && err.response.data.message !== "No auth token") setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
      setUserData({
        isLoading: false,
        authenticated: false
      })
    })
    console.log("%c%s","color: red; background: yellow; font-size: 24px;","WARNING!");
    console.log("%c%s","font-size: 18px;","Using this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.\nDo not enter or paste code that you do not understand.")
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
      <Route path='/reset-password' exact component={ReqResetPassword} />
      <Route path='/reset-password/:id/:token' component={ResetPassword} />
      <Route path='/verify/:id/:token' component={VerifyAccount} />
      <Route path='/privacy-policy' component={PrivacyPolicy} />
      <Route path='/terms-and-conditions' component={TermsAndConditions} />
    </Router>
  );
}