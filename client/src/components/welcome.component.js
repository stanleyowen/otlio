import React, { useEffect, useState } from 'react'
import Image from '../img/7c27535f88bae9519ceb14a8983c57ff.webp'
import axios from 'axios'

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const GITHUB_API = "https://api.github.com/repos/stanleyowen/todo-application"

const Landing = () => {
    const [repoInfo, setRepoInfo] = useState([])
    const currentversion = process.env.REACT_APP_VERSION

    useEffect(() => {
        const element = document.querySelector('.text-animation')
        const data = element.getAttribute('data-elements').split(',')
        var x = 0; var index = 0; var interval;
        function type() {
            var text = data[x].substring(0, index+1)
            element.innerHTML = text
            index++
            if(text === data[x]){
                clearInterval(interval)
                setTimeout(() => interval = setInterval(backspace, 25), 3000)
            }
        }
        function backspace() {
            var text = data[x].substring(0, index-1)
            element.innerHTML = text
            index--
            if(text === ''){
                clearInterval(interval)
                if(x === (data.length-1)) x = 0
                else x++
                index = 0
                setTimeout(() => interval = setInterval(type, 100), 200)
            }
        }
        async function getRepoInfo() {
            await axios.get(GITHUB_API)
            .then(async res => {
                setRepoInfo([res.data.stargazers_count, res.data.license.spdx_id])
                await axios.get(`${GITHUB_API}/releases`)
                .then(res => {
                    let latestVersion =  res.data[0] ? res.data[0].tag_name.slice(1) : '1.0.0'
                    if(currentversion !== latestVersion) setNotification(NOTIFICATION_TYPES.WARNING, `Version ${latestVersion} is available`)
                })
                .catch(err => {
                    if(err.response.data.message) setNotification(NOTIFICATION_TYPES.DANGER, 'ERR: '+err.response.data.message)
                    else setNotification(NOTIFICATION_TYPES.DANGER, "ERR: Couldn't Check for Updates")
                })
            })
            .catch(err => {
                if(err.response.data.message) setNotification(NOTIFICATION_TYPES.DANGER, 'ERR: '+err.response.data.message)
                else setNotification(NOTIFICATION_TYPES.DANGER, "ERR: Invalid API")
            })
        }
        getRepoInfo()
        interval = setInterval(type, 100)
    },[currentversion])
    
    return (
        <div>
            <div className="main">
                <div className="contact__container">
                    <div className="center-object">
                        <div className="inline">
                            <span className="blue-text monospace text-animation" data-elements="Organizing Easier, Improve Productivity"></span>
                            <span className="cursor large">&nbsp;</span>
                        </div>
                        <h1 className="monospace" style={{fontSize: '40px'}}>with Todo Application</h1>
                        <h3 className="mt-40 monospace">An open source project, completed with <b>highest standard security</b>, which is easy to use and easy to organize!</h3>
                        <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href="/get-started">Get Started</a>
                    </div>
                    <img className="center-object" src={Image} alt="Organzing Easier" />
                </div>
            </div>
            <div className="isCentered badges mt-40 mb-40">
                <a href="https://github.com/stanleyowen/todo-application/stargazers" target="_blank" rel="noreferrer"><button className="btn__label">Stars</button><button className="btn__value">{repoInfo[0]}</button></a>
                <a href="https://github.com/stanleyowen/todo-application/blob/master/LICENSE" target="_blank" rel="noreferrer"><button className="btn__label">License</button><button className="btn__value">{repoInfo[1]}</button></a>
                <a href="https://github.com/stanleyowen/todo-application/releases" target="_blank" rel="noreferrer"><button className="btn__label">Version</button><button className="btn__value">{currentversion}</button></a>
            </div>
        </div>
    )
}

export default Landing