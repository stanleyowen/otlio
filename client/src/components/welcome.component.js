import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { CardActionArea } from '@material-ui/core'

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const GITHUB_API = "https://api.github.com/repos/stanleyowen/otlio"

const Landing = () => {
    const [repoInfo, setRepoInfo] = useState([])
    const currentversion = document.querySelector('meta[name="version"]').content

    useEffect(() => {
        const element = document.querySelector('.text-animation')
        const data = element.getAttribute('data-elements').split(',')
        var x = 0; var index = 0; var interval
        function type() {
            var text = data[x].substring(0, index+1)
            element.innerText = text
            index++
            if(text === data[x]) {
                clearInterval(interval)
                setTimeout(() => interval = setInterval(backspace, 25), 3000)
            }
        }
        function backspace() {
            var text = data[x].substring(0, index-1)
            element.innerText = text
            index--
            if(text === '') {
                clearInterval(interval)
                x === (data.length-1) ? x=0 : x++
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
                        <h1 className="monospace" style={{fontSize: '40px'}}>with Otlio</h1>
                        <h3 className="mt-40 monospace">An open source project, completed with <b>highest standard security</b>, which is easy to use and organize!</h3>
                        <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href="/get-started">Get Started</a>
                    </div>
                    <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/7c27535f88bae9519ceb14a8983c57ff_mpieim.webp" alt="Organzing Easier" />
                </div>
            </div>
            <div className="isCentered badges mt-40 mb-40">
                <a href="https://github.com/stanleyowen/otlio/stargazers" target="_blank" rel="noopener"><button className="btn__label">Stars</button><button className="btn__value">{repoInfo[0]}</button></a>
                <a href="https://github.com/stanleyowen/otlio/blob/master/LICENSE" target="_blank" rel="noopener"><button className="btn__label">License</button><button className="btn__value">{repoInfo[1]}</button></a>
                <a href="https://github.com/stanleyowen/otlio/releases" target="_blank" rel="noopener"><button className="btn__label">Version</button><button className="btn__value">{currentversion}</button></a>
            </div>
            <h1 className="mt-40 isCentered monospace">Features</h1>
            <div className="contact__container mb-20">
                <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072617/otlio/e91e6348157868de9dd8b25c81aebfb9_ynvmkr.webp" alt="Built-In Security" />
                <div className="center-object full-width">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Built-In Security</h1>
                            <h3 className="raleway">Otlio Service Security is secure by default which uses:</h3>
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
                <img className="center-object phone-device" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/af051c89597cd018ce51bd8fd53014ff_zpl0bt.webp" alt="Reliable Services" />
                <div className="center-object full-width">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">99% Uptime</h1>
                            <h3 className="raleway">We are committed to making our products and services accessible to everyone in any region. Our infrastructures are configured to automatically switch to another available API(s) when the server is down or under maintenance.</h3>
                            <h3 className="raleway mt-20">Otlio Infrastructures are hosted on:</h3>
                            <ul className="ul-ml40 ul-mb10 medium">
                                <li className="mt-20">Netlify: <a className="link" href="https://otlio.netlify.app" target="_blank" rel="noreferrer">otlio.netlify.app</a></li>
                                <li>Heroku:
                                    <ul className="medium">
                                        <li className="mt-20"><a className="link" href="https://otlio-eu.herokuapp.com" target="_blank" rel="noreferrer">otlio-eu.herokuapp.com</a> (Europe)</li>
                                        <li><a className="link" href="https://otlio-us.herokuapp.com" target="_blank" rel="noreferrer">otlio-us.herokuapp.com</a> (United States)</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </CardActionArea>
                    <a className="oauth-box outline-blue isCentered block mt-10 mb-20 p-12 button monospace" href="https://otlio.statuspage.io/" target="_blank" rel="noopener">Service Status and Uptime</a>
                </div>
                <img className="center-object pc-device" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/af051c89597cd018ce51bd8fd53014ff_zpl0bt.webp" alt="Reliable Services" />
            </div>
            <div className="contact__container mb-40">
                <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/589612f86db2a2b483b007bc2a1e9665_db0zwi.webp" alt="Open Source Project" />
                <div className="center-object full-width">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Open Source Project</h1>
                            <h3 className="raleway">Otlio is completely an open source project which is hosted publicly on <a className="link" href="https://github.com/stanleyowen/otlio" target="_blank" rel="noopener">GitHub</a>. Some objectives we made this project into open source are:</h3>
                            <ul className="ul-ml40 ul-mb10 medium mb-20">
                                <li className="mt-20"><b>Flexibility</b>, which can be customized to meet some prerequisites.</li>
                                <li><b>Transparency</b>, which allow everyone to get full visibility into the code base, discussions, etc.</li>
                                <li><b>Continuous Evolution</b>, for better code quality</li>
                                <li><b>Security and Reliability</b></li>
                            </ul>
                        </div>
                    </CardActionArea>
                    <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href="https://github.com/stanleyowen/otlio" target="_blank" rel="noopener">View Code on GitHub</a>
                </div>
            </div>
            <div className="contact__container mb-20">
                <img className="center-object phone-device" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622188175/otlio/95cc64dd2825f9df13ec4ad683ecf339_ukjqzi.webp" alt="Customer Support" />
                <div className="center-object full-width">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Customer Support</h1>
                            <h3 className="raleway">We are here to help. Get in touch with us or support, let us know how we can help, and our support teams will get in touch with you as soon as possible.</h3>
                        </div>
                    </CardActionArea>
                    <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href="/support">Get Support</a>
                </div>
                <img className="center-object pc-device" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622188175/otlio/95cc64dd2825f9df13ec4ad683ecf339_ukjqzi.webp" alt="Customer Support" />
            </div>
        </div>
    )
}

export default Landing