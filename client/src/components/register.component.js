import React, { useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons/';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { OAuthGitHub, OAuthGoogle, getCSRFToken } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Register = ({ userData }) => {
    const {status} = userData;
    const {verifyAccount} = userData.type;
    const {email} = userData.credentials;
    const [properties, setProperties] = useState({
        honeypot: '',
        verify: false,
        password: false,
        confirmPassword: false
    })
    const [register, setRegister] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    const handleRegister = (a, b) => setRegister({ ...register, [a]: b })

    useEffect(() => {
        if(status === 302 && !properties.verify && verifyAccount) handleChange('verify', true);
    }, [userData, properties.verify])

    const Register = (e) => {
        e.preventDefault();
        const btn = document.getElementById('register');
        async function submitData(){
            btn.innerHTML = "Registering..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.post(`${SERVER_URL}/account/register`, register, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                handleChange('verify', true)
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Register"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(properties.honeypot) return;
        else if(!register.email || !register.password || !register.confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!register.email ? 'userEmail' : !register.password ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(EMAIL_VAL.test(String(register.email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else if(register.email.length < 6 || register.email.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 40 characters !'); document.getElementById('userEmail').focus(); }
        else if(register.password.length < 6 || register.password.length > 40 || register.confirmPassword.length < 6 || register.confirmPassword.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById(register.password.length < 6 || register.password.length > 40 ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(register.password !== register.confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('userConfirmPassword').focus(); }
        else submitData();
    }

    const sendLink = (e) => {
        e.preventDefault();
        const btn = document.getElementById('send-link');
        async function submitData() {
            btn.innerHTML = "Sending..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.post(`${SERVER_URL}/account/verify`, null, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Resend Link"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        } submitData();
    }

    return properties.verify ? (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Almost there ...</h1></div>
                <div className="form">
                    <h4 className="mt-20 mb-20 isCentered">Please check your email ({ email ? email : register.email }) to confirm your account.</h4>
                    <hr />
                    <h4 className="mt-20 mb-20 isCentered">If { email ? email : properties.email } is not your email address, please click Logout and enter the correct one.</h4>
                    <h4 className="mt-20 mb-20 isCentered">If it hasn't arrived after a few minutes, check your spam folder or click on the resend button.</h4>
                    <button className="contact__sendBtn solid" id="cancel" onClick={() => window.location='/logout'}>Logout</button>
                    <button className="contact__sendBtn ml-10" id="send-link" onClick={sendLink}>Resend Link</button>
                </div>
            </div>
        </div>
    ) : (
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
                    <form className="contact__form" name="contact__form" onSubmit={Register}>
                        <div className="m-10 no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-email">Email <span className="required">*</span></label>
                                <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email <span className="required">*</span></label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="40" onChange={(event) => handleRegister('email', event.target.value)} value={register.email} autoFocus required autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="form__container">
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                    <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' } minLength="6" maxLength="40" className="contact__inputField" onChange={(event) => handleRegister('password', event.target.value)} value={register.password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                        <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="userConfirmPassword">Confirm Password <span className="required">*</span></label>
                                    <input title="Confirm Password" id="userConfirmPassword" type={ properties.confirmPassword ? 'text':'password' } minLength="6" maxLength="40" className="contact__inputField" onChange={(event) => handleRegister('confirmPassword', event.target.value)} value={register.confirmPassword} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.confirmPassword ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', !properties.confirmPassword)}>
                                        <FontAwesomeIcon icon={properties.confirmPassword ? faEyeSlash : faEye} />
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