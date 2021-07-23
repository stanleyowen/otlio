import axios from 'axios'
import React, { useEffect } from 'react'

const ReqOAuth = ({ userData }) => {
    const {isLoading, authenticated, server: SERVER_URL} = userData
    const {pathname} = window.location
    const code = window.location.search

    useEffect(() => {
        if(SERVER_URL)
        document.querySelectorAll('button, input').forEach(a => {
            a.classList.remove('disabled')
            a.removeAttribute('disabled')
        })
        else
        document.querySelectorAll('button, input').forEach(a => {
            a.classList.add('disabled')
            a.setAttribute('disabled', true)
        })
    }, [SERVER_URL])

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