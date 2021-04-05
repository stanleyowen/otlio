import React, { useState } from 'react';
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
        const btn = document.getElementById('reset-password');
        async function submitData(){
            btn.innerHTML = "Sending...";
            await axios.post(`${SERVER_URL}/account/forget-password`, { email }, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then(() => setSent(true))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Send";
        }
        if(honeypot) { return }
        else if(!email) setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All the Required Fields !')
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    if(sent) return(
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Password Reset Request Sent</h1></div>
                <div className="form">
                    <h4 className="mt-20 mb-20">Password Reset Recovery has been sent to your email for reset your password. If it hasn't arrived after a few minutes, check your spam folder.</h4>
                </div>
            </div>
        </div>);
    else return (
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
                                <label htmlFor="userEmail">Enter your user account's verified email address and we will send you a password reset link.</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <button type="submit" className="contact__sendBtn" id="reset-password">Send</button>
                    </form>
                </div>
            </div>
        </div>)
}

export default ResetPassword;