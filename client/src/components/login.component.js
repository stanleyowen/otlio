import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Tooltip, IconButton, FormControlLabel, Checkbox } from '@material-ui/core';
import { faQuestionCircle, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons/';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { OAuthGitHub, OAuthGoogle, getCSRFToken } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Login = ({ userData }) => {
    console.log(userData)
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [honeypot, setHoneypot] = useState();
    const [data, setData] = useState({
        tokenId: null,
        token: null
    })
    const [properties, setProperties] = useState({
        password: false,
        rememberMe: true,
        verify: false
    });
    const LogIn = (e) => {
        e.preventDefault();
        const btn = document.getElementById('login');
        async function submitData(){
            btn.innerHTML = "Logging In..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.post(`${SERVER_URL}/account/login`, { email, password, rememberMe: properties.rememberMe }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => console.log(res.data, 'Helllo'))
            .catch(err => {
                if(err.response.status === 302){
                    handleChange('verify', properties.verify);
                    handleData('tokenId', err.response.data.tokenId);
                }
                else setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            })
            btn.innerHTML = "Login"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(honeypot) return;
        else if(!email || !password) { setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!email ? 'userEmail' : 'userPassword').focus(); }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else submitData();
    }

    const VerifyOTP = (e) => {
        e.preventDefault();
        console.log(data)
        const btn = document.getElementById('verify');
        async function submitData(){
            btn.innerHTML = "Verifying..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.post(`${SERVER_URL}/account/otp`, { tokenId: data.tokenId, token: data.token }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Login"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(honeypot) return;
        else if(!email || !password) { setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!email ? 'userEmail' : 'userPassword').focus(); }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else submitData();
    }
    const handleChange = (a, b) => setProperties({ ...properties, [a]: !b });
    const handleData = (a, b) => setData({ ...data, [a]: b });

    return properties.verify ? (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Verification</h1></div>
                <div className="form">
                    <form className="contact__form" onSubmit={VerifyOTP}>
                        <div className="contact__formControl no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-email">Email</label>
                                <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" value={email} required readOnly disabled/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userPassword">Verification Code</label>
                                <input title="Verification Code" id="code" type="text" className="contact__inputField" onChange={(event) => handleData('token', event.target.value)} value={data.token} required spellCheck="false" autoCapitalize="none" autoComplete='one-time-code' />
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <button type="submit" className="contact__sendBtn" id="verify">Verify</button>
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
                    <div className="contact__formControl no-bot">
                        <div className="contact__infoField">
                            <label htmlFor="bot-email">Email</label>
                            <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="userEmail">Email</label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="userPassword">Password</label>
                            <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' } className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off':'current-password'} />
                            <span className="contact__onFocus"></span>
                            <IconButton className="view-eye" onClick={() => handleChange('password', properties.password)}>
                                <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                            </IconButton>
                        </div>
                        <div className="contact__formControl show-password">
                            <FormControlLabel control={<Checkbox properties={properties.rememberMe} onChange={() => handleChange('rememberMe', properties.rememberMe)} color="primary"/>}
                            label="Stay Signed In"/><Tooltip placement="top" title="If you are using Public computer or WiFi, it is recommended to uncheck this and you'll be logged out after browsing session ends." arrow><span><FontAwesomeIcon icon={faQuestionCircle} size="small" /></span></Tooltip> 
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
