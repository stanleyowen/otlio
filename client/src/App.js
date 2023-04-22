import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import './App.min.css'
import { setNotification, NOTIFICATION_TYPES } from './libraries/setNotification'

import Navbar from './components/navbar.component'
import Landing from './components/landing.component'
import Register from './components/register.component'
import Login from './components/login.component'
import Logout from './components/logout.component'
import OAuth from './components/register-oauth.component'
import Support from './components/support.component'
import ReqOAuth from './components/req-oauth.component'
import Home from './components/home.component'
import Account from './components/account.component'
import EditTodo from './components/edit.component'
import ResetPassword from './components/reset-password.component'
import ReqResetPassword from './components/forgot-password.component'
import VerifyAccount from './components/verify-account.component'
import PageNotFound from './components/404.component'
import PrivacyPolicy from './components/privacy-policy.component'
import TermsAndConditions from './components/terms-and-condition.component'

export default function App() {
  const [server, setServer] = useState()
  const [userData, setUserData] = useState({ isLoading: true, type: {}, credentials: {} })
  const protectedRoute = ['app', 'edit', 'account']
  const redirectRoute = ['login', 'get-started']
  const server_list = process.env.REACT_APP_SERVER.split(',')
  const info = JSON.parse(localStorage.getItem('info'))

  if(info && info.status && info.message) {
    setNotification(info.status === 200 ? NOTIFICATION_TYPES.SUCCESS : NOTIFICATION_TYPES.DANGER, info.message)
    localStorage.removeItem('info')
  }
  if(!userData.isLoading && userData.authenticated) {
    redirectRoute.forEach(a => {
      if(window.location.pathname.split('/')[1] === a) window.location='/app'
    })
  }else if(!userData.isLoading && !userData.authenticated) {
    protectedRoute.forEach(a => {
      if(window.location.pathname.split('/')[1] === a){
        if(window.location.pathname.split('/')[1] !== 'app') window.location=`/login?next=${encodeURIComponent(window.location.pathname)}`
        else window.location = '/login'
      }
    })
  }

  useEffect(() => {
    async function getData() {
      await axios.get(`${server}/account/user`, { withCredentials: true })
      .then(res => {
        setUserData({
          status: res.status,
          isLoading: false,
          id: res.data.credentials.id,
          email: res.data.credentials.email,
          authenticated: res.data.credentials.authenticated,
          thirdParty: res.data.credentials.thirdParty,
          verified: res.data.credentials.verified,
          security: res.data.credentials.security,
          server
        })
        localStorage.setItem('XSRF-TOKEN', res.data['XSRF-TOKEN'])
      })
      .catch(err => {
        setUserData({ type: {}, credentials: {}, security: {}, ...err.response.data, isLoading: false, authenticated: false, server })
        localStorage.setItem('XSRF-TOKEN', err.response.data['XSRF-TOKEN'])
        localStorage.removeItem('todoData')
        if(err.response.status === 302 && err.response.data.type.mfa && (window.location.pathname !== '/login' && window.location.pathname !== '/logout' && window.location.pathname !== '/support')) window.location='/login'
        if(err.response.status === 302 && err.response.data.type.verifyAccount && (window.location.pathname !== '/get-started' && window.location.pathname !== '/logout' && window.location.pathname !== '/support' && window.location.pathname.split('/')[1] !== 'verify' )) window.location='/get-started'
        if(err.response.data.message && err.response.data.message !== "No auth token") setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
      })
    }
    if(server) getData()
  },[server])

  useEffect(() => {
    async function ping(a) {
      await axios.get(`${server_list[a]}/status`)
      .then(() => setServer(server_list[a]))
      .catch(err => {
        if((err.response && err.response.status >= 500) && server_list[a+1]) ping(a+1)
        else if(!err.response && server_list[a+1]) ping(a+1)
      })
    }
    console.log("%c%s","color: red; background: yellow; font-size: 24px","WARNING!")
    console.log("%c%s","font-size: 18px","Using this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.\nDo not enter or paste code that you do not understand.")
    ping(0)
  }, [])

  useEffect(() => {
    if(server)
      document.querySelectorAll('button, input').forEach(a => {
        a.classList.remove('disabled')
        a.removeAttribute('disabled')
      })
    else
      document.querySelectorAll('button, input').forEach(a => {
          a.classList.add('disabled')
          a.setAttribute('disabled', true)
      })
  }, [server])

  return (
    <Router>
      <Navbar userData={userData} />
      <Switch>
        <Route path='/' exact component={Landing} />
        <Route path='/app' component={() => <Home userData={userData} />} />
        <Route path='/get-started' component={() => <Register userData={userData} />} />
        <Route path='/login' component={() => <Login userData={userData} />} />
        <Route path='/logout' component={() => <Logout userData={userData} />} />
        <Route path='/edit/:id' component={() => <EditTodo userData={userData} />} />
        <Route path='/oauth' component={() => <ReqOAuth userData={userData} />} />
        <Route path='/auth/:service/:email' component={() => <OAuth userData={userData} />} />
        <Route path='/account' component={() => <Account userData={userData} />} />
        <Route path='/support' component={() => <Support userData={userData} />} />
        <Route path='/reset-password' exact component={() => <ReqResetPassword userData={userData} />} />
        <Route path='/reset-password/:id/:token' component={() => <ResetPassword userData={userData} />} />
        <Route path='/verify/:id/:token' component={() => <VerifyAccount userData={userData} />} />
        <Route path='/privacy-policy' component={PrivacyPolicy} />
        <Route path='/terms-and-conditions' component={TermsAndConditions} />
        <Route path='*' component={() => <PageNotFound userData={userData} />} />
      </Switch>
    </Router>
  )
}