import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

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
                else window.location = '/';
            })
        }
        validateData();
    },[code, service])

    return(<div></div>)
}

export default ReqOAuth;