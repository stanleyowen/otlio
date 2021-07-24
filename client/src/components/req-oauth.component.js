import axios from 'axios'
import React, { useEffect } from 'react'

const ReqOAuth = ({ userData }) => {
    const {isLoading, authenticated, server: SERVER_URL} = userData
    const {pathname} = window.location
    const code = window.location.search

    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}${pathname}${code}`, { withCredentials: true })
            .then(res => {
                if(authenticated){
                    localStorage.setItem('info', JSON.stringify(res.data))
                    window.location='/account'
                }else window.location='/app'
            })
            .catch(err => {
                if(err.response.status === 302) window.location = err.response.data.url ? err.response.data.url : '/login'
                else {
                    localStorage.setItem('info', JSON.stringify(err.response.data))
                    window.location = authenticated ? '/account' : '/login'
                }
            })
        }
        if(!isLoading && SERVER_URL) validateData()
    },[code, pathname, SERVER_URL])

    return(<div className="loader"><div className="spin-container"><div className="loading">
        <div></div><div></div><div></div>
        <div></div><div></div>
    </div></div></div>)
}

export default ReqOAuth