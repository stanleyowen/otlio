import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Tooltip, IconButton } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash, faEnvelope, faChartLine } from '@fortawesome/free-solid-svg-icons/'

import { getCSRFToken } from '../libraries/validation'
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const OAuth = ({ userData }) => {
    const {server: SERVER_URL} = userData
    const {service, email: rawEmail} = useParams()
    const [data, setData] = useState({
        email: decodeURIComponent(rawEmail),
        password: '',
        confirmPassword: ''
    })
    const [properties, setProperties] = useState({
        honeypot: '',
        password: false,
        confirmPassword: false
    })

    const handleData = (a, b) => setData({ ...data, [a]: b })
    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/oauth/${service}/register`, { params: {email: data.email}, withCredentials: true })
            .then().catch(() => window.location='/login')
        }
        if(SERVER_URL) validateData()
    },[service, data.email, SERVER_URL])


    const Submit = (e) => {
        e.preventDefault()
        const btn = document.getElementById('register')
        async function submitData() {
            btn.innerText = "Creating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/oauth/${service}/register`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/app')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerText = "Create Account"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        }
        if(properties.honeypot) return
        else if(!data.email || !data.password || !data.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!data.email ? 'userEmail' : !data.password ? 'userPassword' : 'userConfirmPassword').focus()}
        else if(EMAIL_VAL.test(String(data.email).toLocaleLowerCase()) === false) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus()}
        else if(data.email.length < 6 || data.email.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 60 characters !'); document.getElementById('userEmail').focus()}
        else if(data.password.length < 6 || data.password.length > 60 || data.confirmPassword.length < 6 || data.confirmPassword.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 60 characters !'); document.getElementById(data.password.length < 6 || data.password.length > 60 ? 'userPassword' : 'userConfirmPassword').focus()}
        else if(data.password !== data.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('userConfirmPassword').focus()}
        else submitData()
    }

    return (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Create your account</h1></div>
                <div className="form">
                    <form className="contact__form" name="contact__form" onSubmit={Submit}>
                        <div className="m-10 no-bot">
                            <div className="contact__infoField">
                                <label htmlFor="bot-email">Email</label>
                                <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off" />
                                <span className="contact__onFocus" />
                            </div>
                        </div>
                        <div className="m-10">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="60" value={data.email} autoFocus required readOnly autoComplete="username" />
                            </div>
                        </div>
                        <div className="form__container">
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                    <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' } className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handleData('password', event.target.value)} value={data.password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off':'new-password'} />
                                    <span className="contact__onFocus" />
                                    <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                        <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="userConfirmPassword">Confirm Password <span className="required">*</span></label>
                                    <input title="Confirm Password" id="userConfirmPassword" type={ properties.confirmPassword ? 'text':'password' } className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handleData('confirmPassword', event.target.value)} value={data.confirmPassword} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.confirmPassword ? 'off':'new-password'} />
                                    <span className="contact__onFocus" />
                                    <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', !properties.confirmPassword)}>
                                        <FontAwesomeIcon icon={properties.confirmPassword ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="oauth-box google isCentered block mt-20 p-12 button" id="register">Create Account</button>
                        <p className="mt-20 small">Signing up signifies that you have read and agree to the <a className="link" href="/terms-and-conditions" target="_blank" rel="noopener">Terms of Service</a> and our <a className="link" href="/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
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
    )
}

export default OAuth