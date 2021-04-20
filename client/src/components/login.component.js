import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Tooltip, IconButton, FormControlLabel, Checkbox } from '@material-ui/core';
import { faQuestionCircle, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons/';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { OAuthGitHub, OAuthGoogle, getCSRFToken, Logout } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Login = ({ userData }) => {
    const [disabled, setDisabled] = useState(false);
    const [properties, setProperties] = useState({
        honeypot: '',
        password: false,
        rememberMe: true,
        verify: false
    })
    const [login, setLogin] = useState({
        email: '',
        password: '',
        rememberMe: true
    })
    const [data, setData] = useState({
        tokenId: '',
        token: ''
    })

    const LogIn = (e) => {
        e.preventDefault();
        const btn = document.getElementById('login');
        async function submitData(){
            btn.innerHTML = "Logging In..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.post(`${SERVER_URL}/account/login`, login, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => {
                if(err.response.status === 302){
                    handleChange('verify', !properties.verify);
                    handleData('tokenId', err.response.data.tokenId);
                }else setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            })
            btn.innerHTML = "Login"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(properties.honeypot) return;
        else if(!login.email || !login.password) { setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!login.email ? 'userEmail' : 'userPassword').focus(); }
        else if(EMAIL_VAL.test(String(login.email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else submitData();
    }

    const VerifyOTP = (e) => {
        e.preventDefault();
        const btn = document.getElementById('verify');
        async function submitData(){
            btn.innerHTML = "Verifying..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.post(`${SERVER_URL}/account/otp`, { tokenId: data.tokenId, token: data.token }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => {
                if(err.response.status === 302){
                    handleChange('verify', !properties.verify);
                    handleData('tokenId', err.response.data.tokenId);
                }else setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            })
            btn.innerHTML = "Verify"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(properties.honeypot) return;
        else if(!data.tokenId) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.");
        else if(!data.token){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById('code').focus(); }
        else submitData();
    }

    const resendCode = (e) => {
        e.preventDefault();
        console.log(data)
        const btn = document.getElementById('status');
        async function submitData(){
            btn.innerHTML = "Resending..."; setDisabled(true);
            await axios.get(`${SERVER_URL}/account/otp`, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                handleData('tokenId', res.data.credentials.tokenId);
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerHTML = "Resend"; setDisabled(false);
        }
        if(properties.honeypot) return;
        else if(!data.tokenId) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.");
        else submitData();
    }

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    const handleLogin = (a, b) => setLogin({ ...login, [a]: b })
    const handleData = (a, b) => setData({ ...data, [a]: b })

    return properties.verify ? (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Verification</h1></div>
                <div className="form">
                    <form className="contact__form" onSubmit={VerifyOTP}>
                        <div className="m-10 no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-login.email">Email</label>
                                <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" value={login.email} required readOnly disabled/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userPassword">Verification Code</label>
                                <input title="Verification Code" id="code" type="text" className="contact__inputField" onChange={(event) => handleData('token', event.target.value)} value={data.token} required spellCheck="false" autoCapitalize="none" autoComplete='one-time-code' />
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <p className="isCentered">Hasn't Received the Code? <a className="animation__underline" id="status" onClick={disabled ? null : resendCode}>Resend Code</a></p>
                        <button type="reset" className="contact__sendBtn solid" id="cancel" onClick={() => window.location='/logout'}>Cancel</button>
                        <button type="submit" className="contact__sendBtn ml-10" id="verify">Verify</button>
                    </form>
                </div>
            </div>
        </div>
    ) : (
    <div id="form">
        <div className="form__contact">
            <div className="get_in_touch"><h1>Login</h1></div>
            <div className="oauth-container">
                <button className="oauth-box google" onClick={OAuthGoogle}>
                    <FontAwesomeIcon icon={faGoogle} size='2x'/> <p> Login with Google</p>
                </button>
                <button className="oauth-box github mt-20" onClick={OAuthGitHub}>
                    <FontAwesomeIcon icon={faGithub} size='2x'/> <p> Login with GitHub</p>
                </button>
            </div>
            <div className="form">
                <form className="contact__form" onSubmit={LogIn}>
                    <div className="m-10 no-bot">
                        <div className="contact__infoField">
                            <label htmlFor="bot-email">Email</label>
                            <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="userEmail">Email</label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => handleLogin('email', event.target.value)} value={login.email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="userPassword">Password</label>
                            <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' } className="contact__inputField" onChange={(event) => handleLogin('password', event.target.value)} value={login.password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off':'current-password'} />
                            <span className="contact__onFocus"></span>
                            <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                            </IconButton>
                        </div>
                        <div className="m-10 show-password">
                            <FormControlLabel control={<Checkbox checked={properties.rememberMe} onChange={() => { handleChange('rememberMe', !properties.rememberMe); handleLogin('rememberMe', !properties.rememberMe) }} color="primary"/>}
                            label="Stay Signed In"/><Tooltip placement="top" title="Not recommended for Public Computer or WiFi" arrow><span><FontAwesomeIcon icon={faQuestionCircle} size="small" /></span></Tooltip> 
                        </div>
                        <p className="isCentered">Having trouble logging in? <a className="animation__underline" href="/reset-password">Reset Password</a></p>
                        <p className="isCentered mt-10">Haven't have an Account? <a className="animation__underline" href="/get-started">Get Started</a></p>
                    </div>
                    <button type="submit" className="contact__sendBtn" id="login">Login</button>
                </form>
            </div>
        </div>
    </div>)
}

export default Login;
