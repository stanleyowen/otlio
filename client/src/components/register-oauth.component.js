import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons/';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { getCSRFToken } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const OAuth = () => {
    const {service, email} = useParams();
    var validatedEmail = decodeURIComponent(email);
    const [password, setPassword] = useState();
    const [confirmPsw, setConfirmPsw] = useState();
    const [honeypot, setHoneypot] = useState();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [cfPasswordVisible, setCfPasswordVisible] = useState(false);

    useEffect(() => {
        async function validateData() {
            await axios.post(`${SERVER_URL}/oauth/${service}/validate`, { email: validatedEmail }, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then().catch(() => window.location = '/login');
        }
        validateData();
    },[service, validatedEmail])

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('register');
        async function submitData(){
            btn.innerHTML = "Registering...";
            const data = { email: validatedEmail, password, confirmPassword: confirmPsw }
            await axios.post(`${SERVER_URL}/oauth/${service}/register`, data, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Register";
        }
        if(honeypot) return;
        else if(!validatedEmail || !password || !confirmPsw){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!validatedEmail ? 'userEmail' : !password ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(EMAIL_VAL.test(String(validatedEmail).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else if(validatedEmail.length < 6 || validatedEmail.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 40 characters !'); document.getElementById('userEmail').focus(); }
        else if(password.length < 6 || password.length > 40 || confirmPsw.length < 6 || confirmPsw.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById(password.length < 6 || password.length > 40 ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(password !== confirmPsw){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('userConfirmPassword').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    return (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Register</h1></div>
                <div className="form">
                    <form className="contact__form" name="contact__form" onSubmit={Submit}>
                        <div className="contact__formControl no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-validatedEmail">Email <span className="required">*</span></label>
                                <input title="Email" id="bot-validatedEmail" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email <span className="required">*</span></label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" value={validatedEmail} autoFocus required disabled="true" autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="form__container">
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                    <input title="Password" id="userPassword" type={ passwordVisible ? 'text':'password' } className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required spellCheck="false" autoCapitalize="none" autoComplete={ passwordVisible ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => setPasswordVisible(!passwordVisible)}>
                                        <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userConfirmPassword">Confirm Password <span className="required">*</span></label>
                                    <input title="Confirm Password" id="userConfirmPassword" type={ cfPasswordVisible ? 'text':'password' } className="contact__inputField" onChange={(event) => setConfirmPsw(event.target.value)} value={confirmPsw} required spellCheck="false" autoCapitalize="none" autoComplete={ cfPasswordVisible ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => setCfPasswordVisible(!cfPasswordVisible)}>
                                        <FontAwesomeIcon icon={cfPasswordVisible ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                        <p className="isCentered">Already have an Account? <a className="animation__underline" href="/login">Login</a></p>
                        <button type="submit" className="contact__sendBtn" id="register">Register</button>
                        <p className="mt-20 small">Signing up signifies that you have read and agree to the <a className="animation__underline" href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms of Service</a> and our <a className="animation__underline" href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default OAuth;