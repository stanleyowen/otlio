import React, { useEffect, useState } from 'react';
import getUserToken from '../library/getUserToken';
import cookies from 'universal-cookie';
import axios from 'axios';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPsw, setConfirmPsw] = useState('');
    const [errMessage, setErrMessage] = useState('');

    const Submit = (e) => {
        e.preventDefault();
        async function submitData(){
            const registerData = { SECRET_KEY, email, password, confirmPsw }
            await axios.post(`${SERVER_URL}/user/register`, registerData)
            .then(res => {
                if(res && res.status === 200){
                    const token = new cookies();
                    token.set('token', res.data.token, {path: '/', maxAge: 604800});
                    window.location = '/';
                }
            })
            .catch(err => { setErrMessage(err.response.data.message); });
        }
        if(!email || !password || !confirmPsw){ setErrMessage('Please Make Sure to Fill Out All the Required Fields !') }
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setErrMessage('Please Prvide a Valid Email Address !'); document.getElementById('email').focus(); }
        else if(email.length < 6 || email.length > 50){ setErrMessage('Please Provide an Email between 6 ~ 50 digits !'); document.getElementById('email').focus(); }
        else if(password.length < 6 || password.length > 30){ setErrMessage('Please Provide a Password between 6 ~ 30 digits !'); document.getElementById('password').focus(); }
        else if(password !== confirmPsw){ setErrMessage('Please Make Sure Both Password are Match !'); document.getElementById('password').focus(); }
        else { submitData(); }
    }

    return (
        <div>
            <div id="form">
                <div className="form__contact">
                    <div className="get_in_touch">
                        <h1>Register</h1>
                    </div>

                    <div className="form">
                        { errMessage ? (<div className="message__error">{errMessage}</div>) : null }
                        <form className="contact__form" name="contact__form" onSubmit={Submit}>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="email">Email <span className="required">*</span></label>
                                    <input title="Email" id="email" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autoFocus/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="form__container">
                                <input type="hidden" name="_honeypot" />
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="password">Password <span className="required">*</span></label>
                                        <input title="Password" id="password" type="password" className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} required/>
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="confirm_psw">Confirm Password <span className="required">*</span></label>
                                        <input title="Confirm Password" id="confirm_psw" type="password" className="contact__inputField" onChange={(event) => setConfirmPsw(event.target.value)} value={confirmPsw} required/>
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="contact__sendBtn">Register</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;