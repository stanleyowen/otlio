import React, { useEffect, useState } from 'react';
import getUserToken from '../library/getUserToken';
import cookies from 'universal-cookie';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPsw, setConfirmPsw] = useState('');
    const [errMessage, setErrMessage] = useState('');
    const Submit = (e) => {
        e.preventDefault();
        if(!email || !password || !confirmPsw){ setErrMessage('Please Make Sure to Fill Out All Required Fields') }
        else if(regex.test(String(email).toLocaleLowerCase()) === false){ setErrMessage('Please Prvide a Valid Email Address') }
        else if(password !== confirmPsw){ setErrMessage('Please Make Sure Both Password are Match!') }
        else { console.log('passed') }
        /*async function submitData(){
            var randomToken = require('random-token').create('~!@#$%^&*()_+=-1234567890abcdefghijklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
            var token = randomToken(80);
            const registerData = { email, password, token }
            console.log(SERVER_URL);    
            await axios.post(`${SERVER_URL}/user/register`, registerData)
            
            .then(res => {
                if(res && res.status === 200){
                    console.log(res.token);
                    cookies().set('token', res.token, {path: '/', maxAge: 604800});
                    window.location = '/';
                }
            })
            .catch(err => console.log(err));
        }
        submitData();*/
    }

    return (
        <div>
            <div id="form">
                <div className="form__contact">
                    <div className="get_in_touch">
                        <h1>Register</h1>
                    </div>

                    <div className="form">
                        { errMessage ? (<div>{errMessage}</div>) : null }
                        <form className="contact__form" name="contact__form" onSubmit={Submit} autoComplete="off">
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="email">Email</label>
                                    <input title="Email" id="email" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} autoFocus/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="form__container">
                                <input type="hidden" name="_honeypot" />
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="password">Password</label>
                                        <input title="Password" id="password" type="password" className="contact__inputField" onChange={(event) => setPassword(event.target.value)} value={password} autoComplete="true" />
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="confirm_psw">Confirm Password</label>
                                        <input title="Confirm Password" id="confirm_psw" type="password" className="contact__inputField" onChange={(event) => setConfirmPsw(event.target.value)} value={confirmPsw} autoComplete="true" />
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="contact__sendBtn">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;