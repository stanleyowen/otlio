import React, { useEffect, useState } from 'react'
import { CardActionArea } from '@material-ui/core'
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
                        <h3 className="mt-40 monospace">An open source project, completed with <b>highest standard security</b>, which is easy to use and organize!</h3>
                        <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href="/get-started">Get Started</a>
                    </div>
                    <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1621693325/todoapp/7c27535f88bae9519ceb14a8983c57ff_xhd84x.webp" alt="Organzing Easier" />
                </div>
            </div>
            <div className="isCentered badges mt-40 mb-40">
                <a href="https://github.com/stanleyowen/todo-application/stargazers" target="_blank" rel="noopener"><button className="btn__label">Stars</button><button className="btn__value">{repoInfo[0]}</button></a>
                <a href="https://github.com/stanleyowen/todo-application/blob/master/LICENSE" target="_blank" rel="noopener"><button className="btn__label">License</button><button className="btn__value">{repoInfo[1]}</button></a>
                <a href="https://github.com/stanleyowen/todo-application/releases" target="_blank" rel="noopener"><button className="btn__label">Version</button><button className="btn__value">{currentversion}</button></a>
            </div>
            <h1 className="mt-40 isCentered monospace">Features</h1>
            <div className="contact__container mb-20">
                <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1621746924/todoapp/e91e6348157868de9dd8b25c81aebfb9_dejbmo.webp" alt="Organzing Easier" />
                <div id="form" className="center-object full-width">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Built-in Security</h1>
                            <h3 className="raleway">Todo Application Service Security is secure by default which uses:</h3>
                            <ul className="ul-ml40 ul-mb10 medium">
                                <li className="mt-20">Up-to-date Dependencies</li>
                                <li><a className="link" href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" target="_blank" rel="noreferrer">Advanced Encryption Standard</a> Algorithm</li>
                                <li>TSL (Transport Layer Security) and SSL (Secure Socket Layer)</li>
                                <li>Rate Limiter to Mitigate DDoS Attacks</li>
                                <li>Technology to protect app from some well-known web vulnerabilities by setting HTTP headers appropriately.</li>
                            </ul>
                        </div>
                    </CardActionArea>
                </div>
            </div>
            <div className="contact__container mb-20">
                <div id="form" className="center-object full-width">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Fast and Reliable</h1>
                            <h3 className="raleway">Todo Application Infrastructures are hosted on:</h3>
                            <ul className="ul-ml40 ul-mb10 medium mb-20">
                                <li className="mt-20">Netlify (Frontend)</li>
                                <li>Heroku (Backend)</li>
                                <li>Cloudinary (Images and Videos CDN)</li>
                            </ul>
                            <h3 className="raleway">Therefore, our services will always online and available on any region including Europe, South America, Asia, and Australia.</h3>
                        </div>
                    </CardActionArea>
                </div>
                <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1621757770/todoapp/af051c89597cd018ce51bd8fd53014ff_qzec3g.webp" alt="Organzing Easier" />
            </div>
            <div className="contact__container mb-40">
                <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1621778423/todoapp/589612f86db2a2b483b007bc2a1e9665_sap5gy.webp" alt="Organzing Easier" />
                <div id="form" className="center-object full-width">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Open Source Project</h1>
                            <h3 className="raleway">Todo Application is completely open source project which is hosted publicly on <a className="link" href="https://github.com/stanleyowen/todo-application">GitHub Cloud Platform</a>. Some objectives we made this project into Open Source are:</h3>
                            <ul className="ul-ml40 ul-mb10 medium mb-20">
                                <li className="mt-20">Flexibility, which can be customized to meet some prerequisites.</li>
                                <li>Transparency, which allow everyone to get full visibility into the code base, discussions, etc.</li>
                                <li>Continuous Evolution, for better code quality</li>
                                <li>Security and Reliability</li>
                            </ul>
                        </div>
                    </CardActionArea>
                    <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href="https://github.com/stanleyowen/todo-application" target="_blank" rel="noopener">View Code on GitHub</a>
                </div>
            </div>
        </div>
    )
}

export default Landing