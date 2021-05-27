import axios from 'axios'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const SERVER_URL = process.env.REACT_APP_SERVER_URL

const VerifyAccount = () => {
    const {id, token} = useParams()
    
    useEffect(() => {
        async function validateData() {
            await axios.get(`${SERVER_URL}/account/verify`, { params: { id, token, type: 'accountVerification' }, withCredentials: true })
            .then(res => {
                localStorage.setItem('info', JSON.stringify(res.data))
                window.location='/'
            })
            .catch(err => {
                if(err.response.status >= 500) setTimeout(() => validateData(), 5000)
                else {
                    localStorage.setItem('info', JSON.stringify(err.response.data))
                    window.location = '/get-started'
                }
            })
        }
        validateData()
    },[id, token])

    return (<div className="loader"><div className="spin-container"><div className="loading">
            <div></div><div></div><div></div>
            <div></div><div></div>
        </div></div></div>)
}

export default VerifyAccount