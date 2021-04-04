import React, { useEffect } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const ReqOAuth = () => {
    const {pathname} = window.location;
    const code = window.location.search;

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}${pathname}${code}`, { withCredentials: true })
            .then(() => window.location = '/')
            .catch(err => {
                if(err.response.data.statusCode === 302) window.location = err.response.data.url;
                else{
                    if(err.response.data.message || err.response.data.error_description){
                        setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message ? err.response.data.message : err.response.data.error_description);
                        setTimeout(() => { window.location='/' }, 5000)
                    }else window.location='/'
                };
            })
        }
        validateData();
    },[code, pathname])

    return(<div className="loader"><div className="spin-container full-width">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
        </div></div>)
}

export default ReqOAuth;