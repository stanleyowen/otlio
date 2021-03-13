import React, { useEffect, useState } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { createRequest, OAuthGitHub } from '../libraries/validation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Login = () => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [honeypot, setHoneypot] = useState();
    const [visible, setVisible] = useState(false);

    useEffect(() => { createRequest(); },[])

    const Submit = (e) => {
        e.preventDefault();
        const btn = document.getElementById('login');
        async function submitData(){
            btn.innerHTML = "Logging In...";
            await axios.post(`${SERVER_URL}/data/accounts/login`, { email, password })
            .then(res => {
                localStorage.setItem('__id', res.data.id);
                localStorage.setItem('__token', res.data.token);
                window.location = '/';
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Login";
        }
        if(honeypot) return;
        else if(!email || !password) setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure to Fill Out All the Required Fields !')
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Prvide a Valid Email Address !'); document.getElementById('email').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    return (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Login</h1></div>
                <div className="oauth-container">
                    <button className="oauth-box" onClick={OAuthGitHub}>
                        <FontAwesomeIcon icon={faGithub} size='2x'/> <p> Login with GitHub</p>
                    </button>
                </div>
                <div className="form">
                    <form className="contact__form" onSubmit={Submit}>
                        <div className="contact__formControl no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-email">Email</label>
                                <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => setHoneypot(event.target.value)} value={honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userPassword">Password</label>
                                <input title="Password" id="userPassword" type={ visible ? 'text':'password' } className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required spellCheck="false" autoCapitalize="none" autoComplete="current-password"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl show-password">
                            <input id="show-password" onClick={() => setVisible(!visible)} type="checkbox" /> <label htmlFor="show-password">Show Pasword</label>
                        </div>
                        <p className="isCentered">Haven't have an Account? <a className="animation__underline" href="/get-started">Get Started</a></p>
                        <button type="submit" className="contact__sendBtn" id="login">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
