import axios from 'axios'
import React, { useState } from 'react'
import { Select, Tooltip, MenuItem } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

import { getCSRFToken } from '../libraries/validation'
import { NOTIFICATION_TYPES, setNotification } from '../libraries/setNotification'

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const ticketTypes = ["Question","Improvement","Security Issue/Bug","Account Management","Others"]
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const CustomerService = 'https://res.cloudinary.com/stanleyowen/image/upload/v1622125690/otlio/765cbf066c6e4c42444a0ce9c2fb7949_li3gyl.webp'
const MessageSent = 'https://res.cloudinary.com/stanleyowen/image/upload/v1622125924/otlio/2405976c7c1485050e78fcf54ca4bfe4_koft6t.webp'

const validateType = (e) => {
    for (let a=0; a<ticketTypes.length; a++){
        if(e === ticketTypes[a]) return false
        else if(a === ticketTypes.length-1 && e !== ticketTypes[a]) return true
    }
}

const Support = ({ userData }) => {
    var {isLoading, authenticated, status, email, server: SERVER_URL} = userData
    if(status === 302) email = userData.credentials.email
    const [data, setData] = useState({
        email,
        type: ticketTypes[0],
        subject: '',
        description: ''
    })
    const [properties, setProperties] = useState({
        honeypot: '',
        success: false
    })

    if(!isLoading && status !== 302 && status !== 200) window.location='/welcome'

    const handleData = (a, b) => setData({ ...data, [a]: b })
    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })

    const submitTicket = (e) => {
        e.preventDefault()
        const btn = document.getElementById('send-request')
        async function openTicket() {
            btn.innerText = "Sending..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.post(`${SERVER_URL}/account/support`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(() => handleChange('success', true))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerText = "Send Request"; btn.removeAttribute("disabled"); btn.classList.remove("disabled")
        }
        if(properties.honeypot) return
        else if(!data.email || EMAIL_VAL.test(String(data.email).toLocaleLowerCase()) === false) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else if(!data.type || !data.subject || !data.description) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!data.type ? 'type' : !data.subject ? 'subject' : 'description').focus()}  
        else if(validateType(data.type)) setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Label")
        else if(data.subject.length < 15 || data.subject.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Subject between 15 ~ 60 chracters"); document.getElementById('subject').focus()}
        else if(data.description.length < 30 || data.description.length > 5000) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description between 30 ~ 5000 chracters"); document.getElementById('description').focus()}
        else openTicket()
    }

    return (
        <div>
            { status !== 302 && status !== 200 ?
            (<div className="loader"><div className="spin-container"><div className="loading">
                <div></div><div></div><div></div>
                <div></div><div></div>
            </div></div></div>) : null }

            <div className="main">
                <div className="contact__container">
                    <div className="center-object">
                        <img src={properties.success ? MessageSent : CustomerService} alt={properties.success ?  "Message Sent" : "Contact Us"} />
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
                    </div>
                    { properties.success ?
                    (<div className="center-object">
                        <h1 className="blue-text monospace">Message Sent</h1>
                        <h3 className="mt-20 monospace">Thank you for submitting the details. We have received your issue(s) and or enhancement(s), and you should receive an email from us after 48 hours.</h3>
                        <button className="oauth-box google isCentered block mt-30 mb-20 p-12 button" onClick={() => authenticated ? window.location='/' : window.location='/get-started'}>Back to Home</button>
                    </div>) :
                    (<div className="no-padding mb-20">
                        <div className="form__contact no-margin">
                            <div className="get_in_touch"><h1 className="monospace blue-text">{properties.success ? 'Message Sent':'Contact Us'}</h1></div>
                            <div className="form">
                                <form className="contact__form" onSubmit={submitTicket}>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="userEmail">From</label>
                                            <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="60" value={data.email} required readOnly autoComplete="username" />
                                        </div>
                                    </div>
                                    <div className="m-10 no-bot">
                                        <div className="contact__infoField">
                                            <label htmlFor="bot-subject">Subject <span className="required">*</span></label>
                                            <input title="Subject" id="bot-subject" type="text" className="contact__inputField" onChange={(e) => handleChange('honeypot', e.target.value)} value={properties.honeypot} autoComplete="off" />
                                            <span className="contact__onFocus" />
                                        </div>
                                    </div>
                                    <div className="m-10 mt-20">
                                        <div className="contact__infoField">
                                            <label htmlFor="subject">Subject <span className="required">*</span></label>
                                            <input title="Subject" id="subject" type="text" className="contact__inputField" minLength="15" maxLength="60" value={data.subject} onChange={(e) => handleData('subject', e.target.value)} autoFocus required />
                                            <span className="contact__onFocus" />
                                            <p className="length">{data.subject.length}/60</p>
                                        </div>
                                    </div>
                                    <div className="m-10 mt-20">
                                        <div className="contact__infoField">
                                            <label htmlFor="type">Ticket Type <span className="required">*</span></label>
                                            <Select id="type" value={data.type} onChange={(e) => handleData('type', e.target.value)} className="mt-10 mb-10 full-width">
                                                { ticketTypes.map(c => { return (<MenuItem key={c} value={c}>{c}</MenuItem>) }) }
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="m-10 mt-20">
                                        <div className="contact__infoField">
                                            <label htmlFor="description">Description <span className="required">*</span></label>
                                            <textarea id="description" className="contact__inputField resize-y" rows="4" minLength="30" maxLength="5000" onChange={(e) => handleData('description', e.target.value)} value={data.description} required />
                                            <span className="contact__onFocus" />
                                            <p className="length">{data.description.length}/5000</p>
                                        </div>
                                    </div>
                                    <button className="mt-30 oauth-box google isCentered block mt-20 p-12 button" id="send-request">Send Request</button>
                                    <p className="mt-20 small">If approved, we will contact you via email and you should receive our email after 48 hours.</p>
                                </form>
                            </div>
                        </div>
                    </div>) }
                </div>
            </div>
        </div>
    )
}

export default Support