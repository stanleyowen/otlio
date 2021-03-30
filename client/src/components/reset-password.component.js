import React, { useState, useEffect } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { getCSRFToken } from '../libraries/validation';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const ResetPassword = () => {
    const parameter = window.location.search.slice(1).split('&');
    const token = parameter[0].split('=')[1];
    const id = parameter[1].split('=')[1];
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPsw, setConfirmPsw] = useState();
    const [honeypot, setHoneypot] = useState();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/account/forget-password`, { params: { token, id } })
            .then(res => setEmail(res.data.email))
            .catch(err => {
                if(err.response.data.message || err.response.data.error_description){
                    setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message ? err.response.data.message : err.response.data.error_description);
                    setTimeout(() => { window.location='/' }, 5000)
                }else window.location='/'
            })
        }
        validateData();
    },[email])

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('register');
        async function submitData(){
            btn.innerHTML = "Resetting Password ...";
            const registerData = { token, id, email, password, confirmPassword: confirmPsw }
            await axios.post(`${SERVER_URL}/account/reset-password`, registerData, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Register";
        }
        if(honeypot) { return }
        else if(!email || !password || !confirmPsw){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All the Required Fields !') }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Prvide a Valid Email Address !'); document.getElementById('validatedEmail').focus(); }
        else if(email.length < 6 || email.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 40 characters !'); document.getElementById('validatedEmail').focus(); }
        else if(password.length < 6 || password.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById('password').focus(); }
        else if(password !== confirmPsw){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('password').focus(); }
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
                                <label htmlFor="bot-validatedEmail">Email <span className="required">*</span></label>
                                <input title="Email" id="bot-validatedEmail" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="email">Email <span className="required">*</span></label>
                                <input title="Email" id="email" type="email" className="contact__inputField" value={email} autoFocus required disabled="true" autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="form__container">
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="password">Password <span className="required">*</span></label>
                                    <input title="Password" id="password" type={ visible ? 'text':'password' } className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required spellCheck="false" autoCapitalize="none" autoComplete="new-password"/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="confirm_psw">Confirm Password <span className="required">*</span></label>
                                    <input title="Confirm Password" id="confirm_psw" type={ visible ? 'text':'password' } className="contact__inputField" onChange={(event) => setConfirmPsw(event.target.value)} value={confirmPsw} required spellCheck="false" autoCapitalize="none" autoComplete="new-password"/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="contact__formControl show-password">
                                <input id="show-oauth-password" onClick={() => setVisible(!visible)} type="checkbox" /> <label htmlFor="show-oauth-password">Show Pasword</label>
                            </div>
                        </div>
                        <button type="submit" className="contact__sendBtn" id="register">Reset Password</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword;