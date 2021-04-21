import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import verifiedSuccess from '../img/verified-success.gif';
import verifiedError from '../img/verified-error.gif';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const VerifyAccount = () => {
    const {id, token} = useParams();
    const [properties, setProperties] = useState({
        isLoading: true,
        success: false
    })
    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/account/verify`, { params: { id, token, type: 'accountVerification' } })
            .then(() => setProperties({ success: true }))
            .catch(err => {
                setProperties({ ...properties, isLoading: false })
                if(err.response.status === 500) setTimeout(() => validateData(), 5000)
                if(err.response.data.message || err.response.data.error_description) setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message ? err.response.data.message : err.response.data.error_description)
            })
        }
        validateData();
    },[id, token])

    return properties.isLoading ? (<div className="loader"><div className="spin-container full-width">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
        </div></div>) : properties.success ? (
            <div id="form">
                <img className="animation__message" src={verifiedSuccess} />
                <div className="get_in_touch"><h1>Account Verified Successfully</h1></div>
            </div>
        ) : (
            <div id="form">
                <img className="animation__message" src={verifiedError} />
                <div className="get_in_touch mt-20"><h1>Oops! Looks like the link is expired or invalid.</h1></div>
            </div>
        );
}

export default VerifyAccount;