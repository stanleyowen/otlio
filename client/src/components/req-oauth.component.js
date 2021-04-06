import React, { useEffect } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const ReqOAuth = () => {
    const {pathname} = window.location;
    const code = window.location.search;

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}${pathname}${code}`, { withCredentials: true })
            .then(res => {
                if(pathname.split('/')[3] === 'connect'){
                    localStorage.setItem('info', JSON.stringify(res.data))
                    window.location='/'
                }else window.location = '/'
            })
            .catch(err => {
                if(err.response.data.statusCode === 302) window.location = err.response.data.url;
                else{
                    localStorage.setItem('info', JSON.stringify(err.response.data));
                    if(pathname.split('/')[3] === 'connect') window.location='/'
                    else window.location='/welcome'
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