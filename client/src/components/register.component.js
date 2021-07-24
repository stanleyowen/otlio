import React, { useState } from 'react'
import { IconButton, Tooltip } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faEnvelope, faChartLine } from '@fortawesome/free-solid-svg-icons/'
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons'
import axios from 'axios'

import { getCSRFToken } from '../libraries/validation'
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const Register = ({ userData }) => {
    const {status, server: SERVER_URL} = userData
    const {verifyAccount} = userData.type
    const {email} = userData.credentials
    const next = new URLSearchParams(window.location.search).get('next')
    const [properties, setProperties] = useState({
        honeypot: '',
        verify: false,
        password: false,
        confirmPassword: false
    })
    const [register, setRegister] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleRegister = (a, b) => setRegister({ ...register, [a]: b })
    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    
    if(status === 302 && !properties.verify && verifyAccount) handleChange('verify', true)

    const Register = (e) => {
        e.preventDefault()
        const btn = document.getElementById('register')
        async function submitData() {
            btn.innerText = "Creating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/register`, register, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                handleChange('verify', true)
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerText = "Create Account"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        }
        if(properties.honeypot) return
        else if(!register.email || !register.password || !register.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!register.email ? 'userEmail' : !register.password ? 'userPassword' : 'userConfirmPassword').focus()}
        else if(EMAIL_VAL.test(String(register.email).toLocaleLowerCase()) === false) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus()}
        else if(register.email.length < 6 || register.email.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 60 characters !'); document.getElementById('userEmail').focus()}
        else if(register.password.length < 6 || register.password.length > 60 || register.confirmPassword.length < 6 || register.confirmPassword.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 60 characters !'); document.getElementById(register.password.length < 6 || register.password.length > 60 ? 'userPassword' : 'userConfirmPassword').focus()}
        else if(register.password !== register.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('userConfirmPassword').focus()}
        else submitData()
    }

    const sendLink = (e) => {
        e.preventDefault()
        const btn = document.getElementById('send-link')
        async function submitData() {
            btn.innerText = "Sending..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/verify`, null, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerText = "Resend Link"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        } submitData()
    }

    return properties.verify ?
    (<div id="form">
        <div className="form__contact">
            <div className="get_in_touch"><h1>Almost there ...</h1></div>
            <div className="form">
                <h4 className="mt-20 isCentered">Please check your email ({ email ? email : register.email }) to confirm your account.</h4>
                <hr className="mt-20" />
                <h4 className="mt-20 mb-20 isCentered">If { email ? email : properties.email } is not your email address, click on the back button and enter the correct one.</h4>
                <h4 className="mt-20 mb-20 isCentered">If you don't receive the e-mail in 5 minutes, please check your spam folder or click the resend button.</h4>
                <h4 className="mt-20 isCentered">If you're experiencing a critical issue, please <a className="link" href="/support">contact support</a>.</h4>
                <div className="contact__container mt-10">
                    <p className="pr-10"><button className="oauth-box google isCentered block mt-10 mb-10 p-12 button" id="cancel" onClick={() => window.location='/logout'}>Back</button></p>
                    <p className="pl-10"><button className="oauth-box google isCentered block mt-10 mb-10 p-12 button" id="send-link" onClick={sendLink}>Resend Link</button></p>
                </div>
            </div>
        </div>
        <div className="footer__socialBtn mt-20 mb-20">
            <Tooltip title="Contact Support" arrow><a href="/support" rel="noopener">
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "1.8em" }} />
            </a></Tooltip>
            <Tooltip title="Current Status" arrow><a href="https://otlio.statuspage.io/" target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faChartLine} style={{ fontSize: "1.8em" }} />
            </a></Tooltip>
            <Tooltip title="View Code on GitHub" arrow><a href="https://github.com/stanleyowen/otlio/" target="_blank" rel="noopener">
                <FontAwesomeIcon icon={faGithub} style={{ fontSize: "1.8em" }} />
            </a></Tooltip>
        </div>
    </div>) :
    (<div id="form">
        <div className="form__contact">
            <div className="get_in_touch"><h1>Create your account</h1></div>
            <div className="contact__container isCentered no-padding">
                <p className="pr-10 p-15">
                    <button className="oauth-box google" onClick={SERVER_URL ? () => window.location = `${SERVER_URL}/oauth/google/auth` : null}>
                        <FontAwesomeIcon icon={faGoogle} size='2x'/> <p> Login with Google</p>
                    </button>
                </p>
                <p className="pl-10 p-15">
                    <button className="oauth-box github" onClick={SERVER_URL ? () => window.location = `${SERVER_URL}/oauth/github/auth` : null}>
                        <FontAwesomeIcon icon={faGithub} size='2x'/> <p> Login with GitHub</p>
                    </button>
                </p>
            </div>
            <div className="form">
                <form className="contact__form" name="contact__form" onSubmit={Register}>
                    <div className="m-10 no-bot">
                        <div className="contact__infoField">
                            <label htmlFor="bot-email">Email</label>
                            <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off" />
                            <span className="contact__onFocus" />
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="userEmail">Email <span className="required">*</span></label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handleRegister('email', event.target.value)} value={register.email} autoFocus required autoComplete="username" />
                            <span className="contact__onFocus" />
                        </div>
                    </div>
                    <div className="form__container">
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' }className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handleRegister('password', event.target.value)} value={register.password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off':'new-password'} />
                                <span className="contact__onFocus" />
                                <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                    <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                                </IconButton>
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userConfirmPassword">Confirm Password <span className="required">*</span></label>
                                <input title="Confirm Password" id="userConfirmPassword" type={ properties.confirmPassword ? 'text':'password' } className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handleRegister('confirmPassword', event.target.value)} value={register.confirmPassword} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.confirmPassword ? 'off':'new-password'} />
                                <span className="contact__onFocus" />
                                <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', !properties.confirmPassword)}>
                                    <FontAwesomeIcon icon={properties.confirmPassword ? faEyeSlash : faEye} />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    <button className="oauth-box google isCentered block mt-20 p-12 button" id="register">Create Account</button>
                    <p className="mt-20 small">Signing up signifies that you have read and agree to the <a className="link" href="/terms-and-conditions" target="_blank" rel="noopener">Terms of Service</a> and our <a className="link" href="/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
                </form>
            </div>
        </div>
        <p className="isCentered mb-10">Already have an Account? <a className="link" href={"/login"+(next?`?next=${encodeURIComponent(next)}`:'')}>Login</a></p>
    </div>)
}

export default Register