import React, { useEffect } from 'react';
import axios from 'axios';
import { getCSRFToken } from '../libraries/validation';

const Logout = ({ userData }) => {
    const {isLoading, authenticated, status} = userData;

    useEffect(() => {
        async function Logout(){
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/account/logout`, {}, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true})
            .then(() => localStorage.setItem('info', JSON.stringify({ statusCode: 200, message: 'You have been logged out successfully.' })))
            .catch(err => localStorage.setItem('info', JSON.stringify(err.response.data)))
            window.location = '/login'
        }
        if(authenticated || status === 302) Logout()
        else if(!isLoading && !authenticated) window.location = '/login'
    }, [authenticated])

    return(
        <div className="loader"><div className="spin-container full-width">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
        </div></div>
    )
}

export default Logout;