import axios from 'axios'
import React, { useState } from 'react'
import { Select, MenuItem } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { Tooltip } from '@material-ui/core'
import Image from '../img/765cbf066c6e4c42444a0ce9c2fb7949.webp'
import MessageSent from '../img/2405976c7c1485050e78fcf54ca4bfe4.webp'

import { NOTIFICATION_TYPES, setNotification } from '../libraries/setNotification'
import { getCSRFToken } from '../libraries/validation'

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const ticketTypes = ["Question","Improvement","Security Issue/Bug","Account Management","Others"]

const validateType = (e) => {
    for (let a=0; a<ticketTypes.length; a++){
        if(e === ticketTypes[a]) return false
        else if(a === ticketTypes.length-1 && e !== ticketTypes[a]) return true
    }
}

const Support = ({ userData }) => {
    const {authenticated, email} = userData
    const [data, setData] = useState({
        email,
        type: ticketTypes[0],
        subject: '',
        description: ''
    })
    const [properties, setProperties] = useState({
        honeypot: '',
        messageSent: false
    })

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    const handleData = (a, b) => setData({ ...data, [a]: b })

    return (
        <div>
            { !authenticated ?
            (<div className="loader"><div className="spin-container"><div className="loading">
                <div></div><div></div><div></div>
                <div></div><div></div>
            </div></div></div>) : null }

            <div className="main">
                <div className="contact__container">
                    <div className="center-object">
                        <img src={properties.messageSent ? MessageSent : Image} alt="Contact Us" />
                        <div className="footer__socialBtn mt-20 mb-20">
                            <Tooltip title="Contact Support" arrow><a href="/support" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "1.8em" }} />
                            </a></Tooltip>
                            <Tooltip title="Current Status" arrow><a href="https://todoapp.freshstatus.io/" target="_blank" rel="noreferrer">
                                <FontAwesomeIcon icon={faChartLine} style={{ fontSize: "1.8em" }} />
                            </a></Tooltip>
                            <Tooltip title="View Code on GitHub" arrow><a href="https://github.com/stanleyowen/todo-application/" target="_blank" rel="noreferrer">
                                <FontAwesomeIcon icon={faGithub} style={{ fontSize: "1.8em" }} />
                            </a></Tooltip>
                        </div>
                    </div>
                    {properties.messageSent ?
                    (<div className="center-object">
                        <h1 className="blue-text monospace">Message Sent</h1>
                        <h3 className="mt-20 monospace">Thank you for submitting the details. We have received your issue(s) and or enhancement(s), and you should receive an email from us after 48 hours.</h3>
                        <button className="oauth-box google isCentered block mt-30 mb-20 p-12 button" onClick={() => userData.authenticated ? window.location='/' : window.location='/welcome'}>Back to Home</button>
                    </div>) :
                    (<div className="no-padding mb-20">
                        <div className="form__contact no-margin">
                            <div className="get_in_touch"><h1 className="monospace blue-text">{properties.messageSent ? 'Message Sent':'Contact Us'}</h1></div>
                            <div className="form">
                                <form className="contact__form" name="contact__form" onSubmit={submitTicket}>
                                    <div className="m-10 no-bot">
                                        <div className="contact__infoField">
                                            <label htmlFor="bot-email">Email</label>
                                            <input title="Email" id="bot-email" type="text" className="contact__inputField" onChange={(event) => handleChange('honeypot', event.target.value)} value={properties.honeypot} autoComplete="off"/>
                                            <span className="contact__onFocus"></span>
                                        </div>
                                    </div>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="userEmail">From</label>
                                            <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="60" value={data.email} required disabled="true" autoComplete="username"/>
                                            <span className="contact__onFocus"></span>
                                        </div>
                                    </div>
                                    <div className="m-10 mt-20">
                                        <div className="contact__infoField">
                                            <label htmlFor="subject">Subject</label>
                                            <input title="Subject" id="subject" type="text" className="contact__inputField" minLength="15" maxLength="60" value={data.subject} onChange={(e) => handleData('subject', e.target.value)} placeholder="Ticket Subject" autoFocus required />
                                            <span className="contact__onFocus"></span>
                                            <p className="length">{data.subject.length}/60</p>
                                        </div>
                                    </div>
                                    <div className="m-10 mt-20">
                                        <div className="contact__infoField">
                                            <label htmlFor="type">Ticket Type</label>
                                            <Select id="type" value={data.type} onChange={(e) => handleData('type', e.target.value)} className="mt-10 mb-10 full-width">
                                                { ticketTypes.map(c => { return (<MenuItem key={c} value={c}>{c}</MenuItem>) }) }
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="m-10 mt-20">
                                        <div className="contact__infoField">
                                            <label htmlFor="description">Description</label>
                                            <textarea id="description" className="contact__inputField resize-y" rows="4" minLength="30" maxLength="1000" onChange={(e) => handleData('description', e.target.value)} value={data.description} required placeholder="Describe your issue as clearly as you can"></textarea>
                                            <span className="contact__onFocus"></span>
                                            <p className="length">{data.description.length}/1000</p>
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