import React, { useEffect } from 'react';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const ReqOAuth = ({ userData }) => {
    const {isLoading, authenticated} = userData;
    const {pathname} = window.location;
    const code = window.location.search;

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}${pathname}${code}`, { withCredentials: true })
            .then(res => {
                if(authenticated){
                    localStorage.setItem('info', JSON.stringify(res.data))
                    window.location='/account'
                }else window.location = '/login'
            })
            .catch(err => {
                if(err.response.status === 302) window.location = err.response.data.url
                else{
                    localStorage.setItem('info', JSON.stringify(err.response.data))
                    if(authenticated) window.location='/account'
                    else window.location='/login'
                };
            })
        }
        if(!isLoading)validateData();
    },[code, pathname])

    return(
        <div className="loader"><div className="spin-container full-width">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
        </div></div>
    )
}

export default ReqOAuth;