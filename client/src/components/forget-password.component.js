import React, { useState, useEffect } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { getCSRFToken } from '../libraries/validation';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const ResetPassword = () => {
    const [sent, setSent] = useState(false);
    const [honeypot, setHoneypot] = useState();
    const [email, setEmail] = useState();

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('register');
        async function submitData(){
            btn.innerHTML = "Sending ...";
            await axios.post(`${SERVER_URL}/account/forget-password`, { email }, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then(() => setSent(true))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Register";
        }
        if(honeypot) { return }
        else if(!email){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All the Required Fields !') }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Prvide a Valid Email Address !'); document.getElementById('validatedEmail').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    return(
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>{ sent ? 'Password Reset Request Sent' : 'Forget Password ?' }</h1></div>
                <div className="form">
                    <form className="contact__form" name="contact__form" onSubmit={ sent ? null : Submit}>
                        <h3 className="mt-20">{ sent ? `Password Reset Recovery has been sent to ${email} which contains the password reset link. The link will only be available for 1 hour and ONCE.` : null }</h3>
                        <h4 className="mt-20">{ sent ? `If it hasn't arrived after a few minutes, check your spam folder, and, if still nothing,`:null} <a onClick={() => window.location.reload()}>{ sent ? `try again.` : null }</a></h4>
                        <div className="contact__formControl no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-validatedEmail">Email <span className="required">*</span></label>
                                <input title="Email" id="bot-validatedEmail" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">{ sent ? null : 'Email' }</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" style={{ display: sent ? 'none':null }} onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <button type="submit" className="contact__sendBtn" id="register" style={{ display: sent ? 'none':null }}>Send</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword;