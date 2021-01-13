import React, { useEffect, useState } from 'react';
import getUserToken from '../library/getUserToken';
import cookies from 'universal-cookie';
import axios from 'axios';


const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPsw, setConfirmPsw] = useState('');

    return (
        <div>
            <div id="form">
                <div className="form__contact">
                    <div className="get_in_touch">
                        <h1>Register</h1>
                    </div>

                    <div className="form">
                        <form className="contact__form" name="contact__form" autocomplete="off">
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="email">Email</label>
                                    <input title="Email" id="email" type="email" className="contact__inputField" onChange={(event) => setEmail(event.target.value)} value={email} required autofocus/>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div class="form__container">
                                <input type="hidden" name="_honeypot" />
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="password">Password</label>
                                        <input title="Password" id="password" type="password" className="contact__inputField"/>
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="confirm_psw">Confirm Password</label>
                                        <input title="Confirm Password" id="confirm_psw" type="password" className="contact__inputField"/>
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="contact__sendBtn">Send <i class="far fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;