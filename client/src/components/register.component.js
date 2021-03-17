import React, { useState, useEffect } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { createRequest, OAuthGitHub, getCSRFToken } from '../libraries/validation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import Axios from 'axios';

const axios = Axios.create({ withCredentials: true });
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Register = () => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPsw, setConfirmPsw] = useState();
    const [honeypot, setHoneypot] = useState();
    const [visible, setVisible] = useState(false);

    useEffect(() => { createRequest(); },[])

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('register');
        async function submitData(){
            btn.innerHTML = "Registering...";
            const registerData = { email, password }
            await axios.post(`${SERVER_URL}/account/register`, registerData, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] } })
            .then(res => {
                localStorage.setItem('__id', res.data.id);
                localStorage.setItem('__token', res.data.token);
                window.location = '/';
            })
            .catch(err => {
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            });
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Register";
        }
        if(honeypot) { return }
        else if(!email || !password || !confirmPsw){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All the Required Fields !') }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Prvide a Valid Email Address !'); document.getElementById('email').focus(); }
        else if(email.length < 6 || email.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 40 characters !'); document.getElementById('email').focus(); }
        else if(password.length < 6 || password.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById('password').focus(); }
        else if(password !== confirmPsw){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('password').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    return (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Register</h1></div>
                <div className="oauth-container">
                    <button className="oauth-box" onClick={OAuthGitHub}>
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
                                <label htmlFor="email">Email <span className="required">*</span></label>
                                <input title="Email" id="email" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} autoFocus required autoComplete="username"/>
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
                                <input id="show-register-password" onClick={() => setVisible(!visible)} type="checkbox" /> <label htmlFor="show-register-password">Show Pasword</label>
                            </div>
                        </div>
                        <p className="isCentered">Already have an Account? <a className="animation__underline" href="/login">Login</a></p>
                        <button type="submit" className="contact__sendBtn" id="register">Register</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;