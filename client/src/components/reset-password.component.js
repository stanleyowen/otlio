import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { IconButton } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons/'

import { getCSRFToken } from '../libraries/validation'
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const ResetPassword = ({ userData }) => {
    const {server: SERVER_URL} = userData
    const {id, token} = useParams()
    const [data, setData] = useState({
        id,
        token,
        email: '',
        password: '',
        confirmPassword: '',
        type: 'passwordReset'
    })
    const [properties, setProperties] = useState({
        honeypot: '',
        isLoading: true,
        password: false,
        confirmPassword: false
    })

    const handleData = (a, b) => setData({ ...data, [a]: b })
    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    
    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/account/forgot-password`, { params: { token, id, type: 'passwordReset' } })
            .then(res => {
                handleChange('isLoading', false)
                handleData('email', res.data.credentials.email)
                document.getElementById('userPassword').focus()
            })
            .catch(err => {
                if(err.response.data.message || err.response.data.error_description){
                    if(err.response.status >= 500) {
                        setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message ? err.response.data.message : err.response.data.error_description)
                        setTimeout(() => validateData(), 5000)
                    }else {
                        localStorage.setItem('info', JSON.stringify(err.response.data))
                        window.location='/reset-password'
                    }
                }else window.location='/reset-password'
            })
        }
        if(SERVER_URL) validateData()
    },[id, token, data.email, SERVER_URL])

    const Submit = (e) => {
        e.preventDefault()
        const btn = document.getElementById('reset-password')
        async function submitData() {
            btn.innerText = "Saving..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/reset-password`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => window.location = '/app')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerText = "Save Password"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        }
        if(properties.honeypot) return
        else if(!data.email || !data.password || !data.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!data.email ? 'userEmail' : !data.password ? 'userPassword' : 'userConfirmPassword').focus()}
        else if(EMAIL_VAL.test(String(data.email).toLocaleLowerCase()) === false) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Valid Email Address !'); document.getElementById('userEmail').focus()}
        else if(data.email.length < 6 || data.email.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide an Email between 6 ~ 60 characters !'); document.getElementById('userEmail').focus()}
        else if(data.password.length < 6 || data.password.length > 60 || data.confirmPassword.length < 6 || data.confirmPassword.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 60 characters !'); document.getElementById(data.password.length < 6 || data.password.length > 60 ? 'userPassword' : 'userConfirmPassword').focus()}
        else if(data.password !== data.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('userConfirmPassword').focus()}
        else submitData()
    }

    return(
        <div>
            { properties.isLoading ?
            (<div className="loader"><div className="spin-container"><div className="loading">
                <div></div><div></div><div></div>
                <div></div><div></div>
            </div></div></div>) : null }

            <div id="form">
                <div className="form__contact">
                    <div className="get_in_touch"><h1>Reset Password</h1></div>
                    <div className="form">
                        <form className="contact__form" name="contact__form" onSubmit={Submit}>
                            <div className="m-10 no-bot">
                                <div className="contact__infoField">
                                    <label htmlFor="bot-validatedEmail">Email</label>
                                    <input title="Email" id="bot-validatedEmail" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off" />
                                    <span className="contact__onFocus" />
                                </div>
                            </div>
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="userEmail">Email</label>
                                    <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="60" value={data.email} required readOnly autoComplete="username" />
                                </div>
                            </div>
                            <div className="form__container">
                                <div className="m-10">
                                    <div className="contact__infoField">
                                        <label htmlFor="userPassword">Password <span className="required">*</span></label>
                                        <input title="Password" id="userPassword" type={ properties.password ? 'text':'password' } className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handleData('password', event.target.value)} value={data.password} required spellCheck="false" autoCapitalize="none" autoComplete={ properties.password ? 'off' : 'new-password' } />
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
                            <button className="oauth-box google isCentered block mt-20 mb-10 p-12 button" id="reset-password">Save Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword