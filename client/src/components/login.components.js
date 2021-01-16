import React, { useEffect, useState } from 'react';
import getUserToken from '../library/getUserToken';
import cookies from 'universal-cookie';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMessage, setErrMessage] = useState('');

    const Submit = (e) => {
        e.preventDefault();
        async function submitData(){
            const registerData = { SECRET_KEY, email, password }
            await axios.post(`${SERVER_URL}/data/users/login`, registerData)
            .then(res => {
                if(res && res.status === 200){
                    const token = new cookies();
                    token.set('token', res.data.token, {path: '/', maxAge: 604800});
                    window.location = '/';
                }
            })
            .catch(err => { setErrMessage(err.response.data.message); });
        }
        if(!email || !password){ setErrMessage('Please Make Sure to Fill Out All the Required Fields !') }
        else { submitData(); }
    }

    return (
        <div>
            <div id="form">
                <div className="form__contact">
                    <div className="get_in_touch">
                        <h1>Login</h1>
                    </div>

                    <div className="form">
                        { errMessage ? (<div className="message__error">{errMessage}</div>) : null }
                        <form className="contact__form" name="contact__form" onSubmit={Submit}>
                            <input type="hidden" name="_honeypot" />
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="email">Email <span className="required">*</span></label>
                                    <input title="Email" id="email" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus autoComplete="username"/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="password">Password <span className="required">*</span></label>
                                    <input title="Password" id="password" type="password" className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required autoComplete="current-password"/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <p style={{textAlign: 'center'}}>Haven't have an Account? <a className="animation__underline" href="/get-started">Get Started</a></p>
                            <button type="submit" className="contact__sendBtn">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;