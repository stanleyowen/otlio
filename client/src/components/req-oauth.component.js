import React, { useEffect } from 'react'
import axios from 'axios'

const SERVER_URL = process.env.REACT_APP_SERVER_URL

const ReqOAuth = ({ userData }) => {
    const {isLoading, authenticated} = userData
    const {pathname} = window.location
    const code = window.location.search

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}${pathname}${code}`, { withCredentials: true })
            .then(res => {
                if(authenticated){
                    localStorage.setItem('info', JSON.stringify(res.data))
                    window.location='/account'
                }else window.location='/'
            })
            .catch(err => {
                if(err.response.status === 302){
                    if(err.response.data.url) window.location = err.response.data.url
                    else window.location='/login'
                }else {
                    localStorage.setItem('info', JSON.stringify(err.response.data))
                    if(authenticated) window.location='/account'
                    else window.location='/login'
                }
            })
        }
        if(!isLoading) validateData()
    },[code, pathname])

    return(<div className="loader"><div className="spin-container"><div class="loading">
        <div></div><div></div><div></div>
        <div></div><div></div>
    </div></div></div>)
}

export default ReqOAuth