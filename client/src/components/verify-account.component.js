import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import verifiedSuccess from '../img/verified-success.mp4';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const VerifyAccount = () => {
    const {id, token} = useParams();
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/account/verify`, { params: { token, id, type: 'accountVerification' } })
            .then(() => setSuccess(true))
            .catch(err => {
                if(err.response.data.message || err.response.data.error_description){
                    setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message ? err.response.data.message : err.response.data.error_description);
                    setTimeout(() => { window.location='/' }, 5000)
                }else window.location='/'
            })
        }
        validateData();
    },[id, token])

    return(
        success ? (
            <div id="form">
                <video autoPlay muted className="animation__message">
                    <source src={verifiedSuccess} type="video/mp4"></source>
                </video>
                <div className="get_in_touch"><h1>Account Verified Successfully</h1></div>
            </div>
        ) : (
            <div className="loader"><div className="spin-container full-width">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>)
    )
}

export default VerifyAccount;