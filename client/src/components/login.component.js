import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { Tooltip, IconButton, FormControlLabel, Checkbox } from '@material-ui/core'
import { faQuestionCircle, faEyeSlash, faEye, faEnvelope, faChartLine, faInfoCircle } from '@fortawesome/free-solid-svg-icons/'

import { getCSRFToken } from '../libraries/validation'
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const isNum =  /^\d+$/
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const Login = ({ userData }) => {
    const {server: SERVER_URL} = userData
    const {mfa} = userData.type
    const {email} = userData.credentials
    const next = new URLSearchParams(window.location.search).get('next')
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

    const handleData = (a, b) => setData({ ...data, [a]: b })
    const handleLogin = (a, b) => setLogin({ ...login, [a]: b })
    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })

    useEffect(() => {
        const btn = document.getElementById('send-otp')
        const otp = document.querySelectorAll('#otp > *[id]')
        for (let i=0; i<otp.length; i++) {
            Object.assign(otp[i], {
                type: 'text', maxLength: 1,
                pattern: '[0-9]', autocomplete: 'off',
                inputMode: 'numeric', required: true
            })
            otp[i].addEventListener('keydown', e => {
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
        async function sendOTP() {
            if(!login.email) handleLogin('email', email); properties.verify = true
            if(btn) btn.innerText = "Sending..."; handleChange('disabled', true)
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
            if(btn) btn.innerText = "Resend"; handleChange('disabled', false)
        }
        if(((userData.status === 302 && !properties.verify && mfa) || properties.sendOTP) && SERVER_URL) {properties.sendOTP = false; sendOTP()}
    }, [userData, properties, data, SERVER_URL])

    const LogIn = e => {
        e.preventDefault()
        const btn = document.getElementById('login')
        async function submitData() {
            btn.innerText = "Logging In..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/login`, login, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = next ? next : '/app')
            .catch(err => {
                if(err.response.status === 302) {handleChange('sendOTP', true); handleChange('verify', true)}
                else setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
            })
            btn.innerText = "Login"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
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
            btn.innerText = "Verifying..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/otp`, {...data, rememberMe: login.rememberMe}, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = next ? next : '/app')
            .catch(err => {
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
                document.getElementById('token-1').focus()
            })
            btn.innerText = "Verify"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        }
        if(properties.honeypot) return
        else if(!data.tokenId) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else if(!data.token) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById('token-1').focus()}
        else if(!isNum.test(data.token)) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid OTP Code Format !"); document.getElementById('token-1').focus()}
        else submitData()
    }
    return properties.verify ?
    (<div>
        { !data.tokenId ?
        (<div className="loader"><div className="spin-container"><div className="loading">
            <div></div><div></div><div></div>
            <div></div><div></div>
        </div></div></div>) : null }
        
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h2>Verify Your Identity</h2></div>
                <div className="form">
                    <form className="contact__form" onSubmit={VerifyOTP}>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" value={login.email} required readOnly disabled/>
                                <span className="contact__onFocus" />
                            </div>
                        </div>
                        <div className="m-10 no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-code">Verification Code</label>
                                <input title="Verification Code" id="bot-code" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                                <span className="contact__onFocus" />
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="token-1">{ data.isBackupCode ? 'Backup Code' : 'Verification Code' } <span className="required">*</span></label>
                                <div id="otp" className="otp flex-wrap justify-center isCentered">
                                    <input id="token-1" /><input id="token-2" /><input id="token-3" />
                                    <input id="token-4" /><input id="token-5" /><input id="token-6" />
                                    { data.isBackupCode ? ([<input id="token-7" />,<input id="token-8" />]) : null }
                                </div>
                            </div>
                        </div>
                        <p className="isCentered mt-20">If you're unable to receive a security code, use one of your <button type="button" className="link-btn link" onClick={() => {handleData('isBackupCode', !data.isBackupCode); document.getElementById('token-1').focus()}}>Backup Codes</button></p>
                        <p className="isCentered mt-10">Hasn't Received the Code? <button type="button" className="link-btn link" id="send-otp" onClick={properties.disabled || !SERVER_URL ? null : () => handleChange('sendOTP', true)}>Resend Code</button></p>
                        <div className="contact__container isCentered no-padding">
                            <p className="pr-10"><button type="reset" className="oauth-box google isCentered block mt-10 mb-10 p-12 button" id="cancel" onClick={() => window.location='/logout'}>Cancel</button></p>
                            <p className="pl-10"><button type="submit" className="oauth-box google isCentered block mt-10 p-12 button" id="verify">Verify</button></p>
                        </div>
                    </form>
                </div>
            </div>
            <div className="footer__socialBtn mb-20">
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
        </div>
    </div>) :
    (<div id="form">
        <div className="form__contact">
            <div className="get_in_touch"><h1>Login</h1></div>
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
                <form className="contact__form" onSubmit={LogIn}>
                    <div className="m-10 no-bot">
                        <div className="contact__infoField">
                            <label htmlFor="bot-email">Email</label>
                            <input title="Email" id="bot-email" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                            <span className="contact__onFocus" />
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="userEmail">
                                Email &nbsp;
                                <Tooltip title="This is your email address you used when you register for Otlio Services" arrow>
                                    <span><FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: "1em" }} /></span>
                                </Tooltip>
                            </label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" onChange={(event) => handleLogin('email', event.target.value)} value={login.email} required autoFocus spellCheck="false" autoCapitalize="none" autoComplete="username"/>
                            <span className="contact__onFocus" />
                        </div>
                    </div>
                    <div className="m-10">
                        <div className="contact__infoField">
                            <label htmlFor="userPassword">Password</label>
                            <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' } className="contact__inputField" onChange={(event) => handleLogin('password', event.target.value)} value={login.password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off' : 'current-password' } />
                            <span className="contact__onFocus" />
                            <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                            </IconButton>
                        </div>
                        <div className="m-10 show-password">
                            <FormControlLabel control={<Checkbox checked={properties.rememberMe} onChange={() => { handleChange('rememberMe', !properties.rememberMe); handleLogin('rememberMe', !properties.rememberMe) }} color="primary"/>}
                            label="Stay Signed In"/><Tooltip placement="top" title="Not recommended for Public Computer and WiFi" arrow><span><FontAwesomeIcon icon={faQuestionCircle} size="sm" /></span></Tooltip> 
                        </div>
                    </div>
                    <button type="submit" className="oauth-box google isCentered block mt-20 mb-10 p-12 button" id="login">Login</button>
                </form>
            </div>
        </div>
        <div className="contact__container isCentered mb-10">
            <p className="mb-10"><a className="link" href="/reset-password">Forgot Password?</a></p>
            <p>Haven't have an Account? <a className="link" href={"/get-started"+(next?`?next=${encodeURIComponent(next)}`:'')}>Get Started</a></p>
        </div>
    </div>)
}

export default Login