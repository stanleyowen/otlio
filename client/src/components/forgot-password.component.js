import React, { useState } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { getCSRFToken } from '../libraries/validation';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const ResetPassword = () => {
    const [honeypot, setHoneypot] = useState();
    const [email, setEmail] = useState();
    const [sent, setSent] = useState(false);

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('reset-password');
        const captcha = document.querySelector('#g-recaptcha-response').value;
        async function submitData(){
            btn.innerHTML = "Sending..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.post(`${SERVER_URL}/account/forgot-password`, { email, captcha }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                setSent(true)
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Send"; btn.removeAttribute("disabled"); btn.classList.remove("disabled");
        }
        if(honeypot) return;
        else if(!email || !captcha) setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All the Required Fields !')
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else submitData();
    }

    return(
        sent ? (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Password Reset Request Sent</h1></div>
                <div className="form">
                    <h4 className="mt-20 mb-20">Password Reset Recovery has been sent to {email} for reset your password. If it hasn't arrived after a few minutes, check your spam folder.</h4>
                </div>
            </div>
        </div>) : (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Reset Password</h1></div>
                <div className="form">
                    <form className="contact__form" name="contact__form" onSubmit={Submit}>
                        <div className="contact__formControl no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-email">Email</label>
                                <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Enter your user account's verified email address and we will send you a password reset link.</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="isCentered">
                            <div className="g-recaptcha" data-sitekey="6LfTOaQaAAAAAMYqu976RhDpm1lJtPciLZ-sk2Qq"></div>
                        </div>
                        <button type="submit" className="contact__sendBtn" id="reset-password">Send</button>
                    </form>
                </div>
            </div>
        </div>)
    )
}

export default ResetPassword;