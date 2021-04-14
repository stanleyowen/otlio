import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons/';
import axios from 'axios';

import { getCSRFToken } from '../libraries/validation';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const ResetPassword = () => {
    const {id, token} = useParams();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [honeypot, setHoneypot] = useState();
    const [visible, setVisibility] = useState({
        password: false,
        confirmPassword: false
    })

    const handleChange = (a, b) => setVisibility({ ...visible, [a]: !b });
    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/account/forgot-password`, { params: { token, id, type: 'passwordReset' } })
            .then(res => setEmail(res.data.credentials.email))
            .catch(err => {
                if(err.response.data.message || err.response.data.error_description){
                    setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message ? err.response.data.message : err.response.data.error_description);
                    setTimeout(() => { window.location='/reset-password' }, 5000)
                }else window.location='/'
            })
        }
        validateData();
    },[id, token, email])

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('reset-password');
        async function submitData(){
            btn.innerHTML = "Changing...";
            const data = { type: 'passwordReset', token, id, email, password, confirmPassword }
            await axios.post(`${SERVER_URL}/account/reset-password`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Change Password";
        }
        if(honeypot) { return }
        else if(!email || !password || !confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!email ? 'userEmail' : !password ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else if(email.length < 6 || email.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 40 characters !'); document.getElementById('userEmail').focus(); }
        else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById(password.length < 6 || password.length > 40 ? 'userPassword' : 'userConfirmPassword').focus(); }
        else if(password !== confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('userConfirmPassword').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    return(
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Reset Password</h1></div>
                <div className="form">
                    <form className="contact__form" name="contact__form" onSubmit={Submit}>
                        <div className="contact__formControl no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-validatedEmail">Email</label>
                                <input title="Email" id="bot-validatedEmail" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" value={email} autoFocus required disabled="true" autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="form__container">
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                    <input title="Password" id="userPassword" type={ visible.password ? 'text':'password' } className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required spellCheck="false" autoCapitalize="none" autoComplete={ visible.password ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => handleChange('password', visible.password)}>
                                        <FontAwesomeIcon icon={visible.password ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userConfirmPassword">Confirm Password <span className="required">*</span></label>
                                    <input title="Confirm Password" id="userConfirmPassword" type={ visible.confirmPassword ? 'text':'password' } className="contact__inputField" onChange={(event) => setConfirmPassword(event.target.value)} value={confirmPassword} required spellCheck="false" autoCapitalize="none" autoComplete={ visible.confirmPassword ? 'off':'new-password'} />
                                    <span className="contact__onFocus"></span>
                                    <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', visible.confirmPassword)}>
                                        <FontAwesomeIcon icon={visible.confirmPassword ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="contact__sendBtn" id="reset-password">Change Password</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword;