import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons/';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { OAuthGitHub, OAuthGoogle, getCSRFToken } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Register = () => {
    const [email, setEmail] = useState();
    const [honeypot, setHoneypot] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [visible, setVisibility] = useState({
        password: false,
        confirmPassword: false
    })

    const handleChange = (a, b) => setVisibility({ ...visible, [a]: !b });
    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('register');
        async function submitData(){
            btn.innerHTML = "Registering..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            const data = { email, password, confirmPassword }
            await axios.post(`${SERVER_URL}/account/register`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Login"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(honeypot) { return }
        else if(!email || !password || !confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!email ? 'userEmail' : !password ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else if(email.length < 6 || email.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 40 characters !'); document.getElementById('userEmail').focus(); }
        else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById(password.length < 6 || password.length > 40 ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(password !== confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('userConfirmPassword').focus(); }
        else submitData();
    }

    return (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Register</h1></div>
                <div className="oauth-container">
                    <button className="oauth-box google" onClick={OAuthGoogle}>
                        <FontAwesomeIcon icon={faGoogle} size='2x'/> <p> Join Us with Google</p>
                    </button>
                    <button className="oauth-box github mt-20" onClick={OAuthGitHub}>
                        <FontAwesomeIcon icon={faGithub} size='2x'/> <p> Join Us with GitHub</p>
                    </button>
                </div>
                <div className="form">
                    <form className="contact__form" name="contact__form" onSubmit={Submit}>
                        <div className="contact__formControl no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-email">Email <span className="required">*</span></label>
                                <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email <span className="required">*</span></label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="40" onChange={(event) => setEmail(event.target.value)} value={email} autoFocus required autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="form__container">
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                    <input title="Password" id="userPassword" type={ visible.password ? 'text':'password' } minLength="6" maxLength="40" className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required spellCheck="false" autoCapitalize="none" autoComplete={ visible.password ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => handleChange('password', visible.password)}>
                                        <FontAwesomeIcon icon={visible.password ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userConfirmPassword">Confirm Password <span className="required">*</span></label>
                                    <input title="Confirm Password" id="userConfirmPassword" type={ visible.confirmPassword ? 'text':'password' } minLength="6" maxLength="40" className="contact__inputField" onChange={(event) => setConfirmPassword(event.target.value)} value={confirmPassword} required spellCheck="false" autoCapitalize="none" autoComplete={ visible.confirmPassword ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', visible.confirmPassword)}>
                                        <FontAwesomeIcon icon={visible.confirmPassword ? faEyeSlash : faEye} />
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

export default Register;