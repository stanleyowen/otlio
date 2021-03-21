import React, { useEffect } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { useParams, useLocation } from 'react-router-dom';
import Axios from 'axios';

const axios = Axios.create({ withCredentials: true });
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const ReqOAuth = () => {
    const {service} = useParams();
    var code = useLocation().search;

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/oauth/${service}${code}`)
            .then(res => {
                localStorage.setItem('__id', res.data.id);
                localStorage.setItem('__token', res.data.token);
                window.location = '/';
            })
            .catch(err => {
                if(err.response.data.statusCode === 302) window.location = err.response.data.url;
                else{
                    if(err.response.data.message || err.response.data.error_description){
                        setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message ? err.response.data.message : err.response.data.error_description);
                        setTimeout(() => { window.location='/' }, 5000)
                    }else window.location='/';
                };
            })
        }
        validateData();
    },[code, service])

    return(<div></div>)
}

export default ReqOAuth;