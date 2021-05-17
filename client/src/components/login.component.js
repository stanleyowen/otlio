import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { Tooltip, IconButton, FormControlLabel, Checkbox } from '@material-ui/core'
import { faQuestionCircle, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons/'
import axios from 'axios'

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'
import { OAuthGitHub, OAuthGoogle, getCSRFToken } from '../libraries/validation'

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const Login = ({ userData }) => {
    const {mfa} = userData.type
    const {email} = userData.credentials
    const [properties, setProperties] = useState({
        honeypot: '',
        verify: false,
        disabled: false,
        password: false,
        sendOTP: false,
        rememberMe: true
    })
    const [login, setLogin] = useState({
        email: '',
        password: '',
        rememberMe: true
    })
    const [data, setData] = useState({
        tokenId: '',
        token: '',
        isBackupCode: false
    })

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    const handleLogin = (a, b) => setLogin({ ...login, [a]: b })
    const handleData = (a, b) => setData({ ...data, [a]: b })

    useEffect(() => {
        const btn = document.getElementById('send-otp')
        const otp = document.querySelectorAll('#otp > *[id]')
        async function sendOTP() {
            if(!login.email) handleLogin('email', email); properties.verify = true
            if(btn) btn.innerHTML = "Sending..."; handleChange('disabled', true)
            await axios.get(`${SERVER_URL}/account/otp`, { withCredentials: true })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                handleData('tokenId', res.data.credentials.tokenId)
                document.getElementById('token-1').focus()
            })
            .catch(err => {
                if(err.response.status >= 500) setTimeout(() => sendOTP(), 5000)
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
            })
            if(btn) btn.innerHTML = "Resend"; handleChange('disabled', false)
        }
        async function OTPInput() {
            for (let i=0; i<otp.length; i++) {
                otp[i].setAttribute('maxlength', 1); otp[i].setAttribute('type', 'text')
                otp[i].setAttribute('pattern', '[0-9]'); otp[i].setAttribute('autocomplete', 'off')
                otp[i].setAttribute('inputmode', 'numeric'); otp[i].setAttribute('required', true)
                otp[i].addEventListener('keydown', (e) => {
                    if(e.key === "Backspace") {
                        if(i !== 0) otp[i-1].focus()
                        otp[i].value = ''
                    }else if((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 95 && e.keyCode < 106)) {
                        if (i !== otp.length-1) otp[i+1].focus()
                        otp[i].value = e.key
                        e.preventDefault()
                    }
                })
            }
        }
        if((userData.status === 302 && !properties.verify && mfa) || properties.sendOTP){ properties.sendOTP = false; sendOTP() }
        OTPInput()
    }, [userData, properties, data])

    const LogIn = (e) => {
        e.preventDefault()
        const btn = document.getElementById('login')
        async function submitData(){
            btn.innerHTML = "Logging In..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/login`, login, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => {
                if(err.response.status === 302){ handleChange('sendOTP', true); handleChange('verify', true) }
                else setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
            })
            btn.innerHTML = "Login"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        }
        if(properties.honeypot) return
        else if(!login.email || !login.password) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!login.email ? 'userEmail' : 'userPassword').focus()}
        else if(EMAIL_VAL.test(String(login.email).toLocaleLowerCase()) === false) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Email Address !"); document.getElementById('userEmail').focus()}
        else submitData()
    }

    const VerifyOTP = (e) => {
        e.preventDefault()
        let token = ''
        const otp = document.querySelectorAll('#otp > *[id]')
        const btn = document.getElementById('verify')
        for (let x=0; x<otp.length; x++) token += otp[x].value
        data.token = token
        async function submitData() {
            btn.innerHTML = "Verifying..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/otp`, {...data, rememberMe: login.rememberMe}, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => {
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
                document.getElementById('token-1').focus()
            })
            btn.innerHTML = "Verify"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        }
        if(properties.honeypot) return
        else if(!data.tokenId) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else if(!data.token){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById('token-1').focus() }
        else submitData()
    }
    return properties.verify ?
    (<div>
        { !data.tokenId ?
        (<div className="loader"><div className="spin-container"><div class="loading">
            <div></div><div></div><div></div>
            <div></div><div></div>
        </div></div></div>) : null }
        
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Verify Your Identity</h1></div>
                <div className="form">
                    <form className="contact__form" onSubmit={VerifyOTP}>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" value={login.email} required readOnly disabled/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="m-10 no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-code">Verification Code</label>
                                <input title="Verification Code" id="bot-code" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="token-1">{ data.isBackupCode ? 'Backup Code' : 'Verification Code' } <span className="required">*</span></label>
                                <div id="otp" className="otp flex justify-center isCentered">
                                    <input id="token-1" />
                                    <input id="token-2" />
                                    <input id="token-3" />
                                    <input id="token-4" />
                                    <input id="token-5" />
                                    <input id="token-6" />
                                    { data.isBackupCode ? (<input id="token-7" />) : null }
                                    { data.isBackupCode ? (<input id="token-8" />) : null }
                                </div>
                            </div>
                        </div>
                        <p className="isCentered mt-20">If you're unable to receive a security code, use one of your <a className="link" onClick={() => handleData('isBackupCode', !data.isBackupCode)}>Backup Codes</a></p>
                        <p className="isCentered">Hasn't Received the Code? <a className="link" id="send-otp" onClick={properties.disabled ? null : () => handleChange('sendOTP', true)}>Resend Code</a></p>
                        <div className="flex isCentered">
                            <p><button type="reset" className="oauth-box google isCentered block mt-20 mb-10 mr-10 p-12 button" id="cancel" onClick={() => window.location='/logout'}>Cancel</button></p>
                            <p><button type="submit" className="oauth-box google isCentered block mt-20 mb-10 ml-10 p-12 button" id="verify">Verify</button></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>) :
    (<div id="form">
        <div className="form__contact">
            <div className="get_in_touch"><h1>Login</h1></div>
            <div className="oauth-container">
                <button className="oauth-box google" onClick={OAuthGoogle}>
                    <FontAwesomeIcon icon={faGoogle} size='2x'/> <p> Login with Google</p>
                </button>
                <button className="oauth-box github mt-20" onClick={OAuthGitHub}>
                    <FontAwesomeIcon icon={faGithub} size='2x'/> <p> Login with GitHub</p>
                </button>
            </div>
            <div className="form">
                <form className="contact__form" onSubmit={LogIn}>
                    <div className="m-10 no-bot">
                        <div className="contact__infoField">
                            <label htmlFor="bot-email">Email</label>
                            <input title="Email" id="bot-email" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="userEmail">Email</label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => handleLogin('email', event.target.value)} value={login.email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="userPassword">Password</label>
                            <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' } className="contact__inputField" onChange={(event) => handleLogin('password', event.target.value)} value={login.password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off' : 'current-password' } />
                            <span className="contact__onFocus"></span>
                            <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                            </IconButton>
                        </div>
                        <div className="m-10 show-password">
                            <FormControlLabel control={<Checkbox checked={properties.rememberMe} onChange={() => { handleChange('rememberMe', !properties.rememberMe); handleLogin('rememberMe', !properties.rememberMe) }} color="primary"/>}
                            label="Stay Signed In"/><Tooltip placement="top" title="Not recommended for Public Computer and WiFi, You'll be logged out after browsing session ends." arrow><span><FontAwesomeIcon icon={faQuestionCircle} size="sm" /></span></Tooltip> 
                        </div>
                    </div>
                    <button type="submit" className="oauth-box google isCentered block mt-20 mb-10 p-12 button" id="login">Login</button>
                </form>
            </div>
        </div>
        <div className="flex isCentered mb-10">
            <p><a className="link" href="/reset-password">Forgot Password?</a></p>
            <p>Haven't have an Account? <a className="link" href="/get-started">Get Started</a></p>
        </div>
    </div>)
}

export default Login