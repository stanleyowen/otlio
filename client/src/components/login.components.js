import React, { useState } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../library/setNotification';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [honeypot, setHoneypot] = useState('');

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('login');
        btn.innerHTML = "Logging In...";
        async function submitData(){
            const registerData = { SECRET_KEY, email, password }
            await axios.post(`https://todoapp-task.herokuapp.com/data/accounts/login`, registerData)
            .then(res => {
                localStorage.setItem('__token', res.data.token);
                localStorage.setItem('__email', res.data.email);
                window.location = '/';
            })
            .catch(err => {
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            });
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Login";
        }
        if(!email || !password){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All the Required Fields !') }
        else if(honeypot) { return }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Prvide a Valid Email Address !'); document.getElementById('email').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    return (
        <div>
            <div id="form">
                <div className="form__contact">
                    <div className="get_in_touch">
                        <h1>Login</h1>
                    </div>

                    <div className="form">
                        <form className="contact__form" name="contact__form" onSubmit={Submit}>
                            <div className="contact__formControl no-bot">
                                <div className="contact__infoField">
                                    <label htmlFor="email">Email <span className="required">*</span></label>
                                    <input title="Email" id="email" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userEmail">Email <span className="required">*</span></label>
                                    <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus autoComplete="username"/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                    <input title="Password" id="userPassword" type="password" className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required autoComplete="current-password"/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <p style={{textAlign: 'center'}}>Haven't have an Account? <a className="animation__underline" href="/get-started">Get Started</a></p>
                            <button type="submit" className="contact__sendBtn" id="login">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;