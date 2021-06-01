import aos from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Skeleton from '@material-ui/lab/Skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faRocket } from '@fortawesome/free-solid-svg-icons'
import { CardActionArea, Tooltip } from '@material-ui/core'

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const GITHUB_API = "https://api.github.com/repos/stanleyowen/otlio"

const Landing = () => {
    aos.init()
    const [repoInfo, setRepoInfo] = useState([])
    const [properties, setProperties] = useState({
        organizingEasier: false,
        security: false,
        cloud: false,
        theme: false,
        github: false,
        support: false
    })
    const currentversion = document.querySelector('meta[name="version"]').content

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })

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
                setTimeout(() => interval = setInterval(backspace, 25), 1000)
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
                setTimeout(() => interval = setInterval(type, 100), 10)
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
                            <span className="blue-text monospace text-animation" data-elements="Organizing Easier, Stay Productive"></span>
                            <span className="cursor large">&nbsp;</span>
                        </div>
                        <h1 className="monospace" style={{fontSize: '40px'}}>with Otlio</h1>
                        <h3 className="mt-40 monospace">Join millions of people getting more organized and productive for free</h3>
                        <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href="/get-started">Get Started</a>
                    </div>
                    {properties.organizingEasier ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.organizingEasier ? "":"none ") + "center-object"} src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/7c27535f88bae9519ceb14a8983c57ff_mpieim.webp" alt="Organzing Easier" onLoad={() => handleChange('organizingEasier', true)} />
                </div>
            </div>
            <div className="isCentered badges mt-40 mb-40">
                <a href="https://github.com/stanleyowen/otlio/stargazers" target="_blank" rel="noopener"><button className="btn__label">Stars</button><button className="btn__value">{repoInfo[0]}</button></a>
                <a href="https://github.com/stanleyowen/otlio/blob/master/LICENSE" target="_blank" rel="noopener"><button className="btn__label">License</button><button className="btn__value">{repoInfo[1]}</button></a>
                <a href="https://github.com/stanleyowen/otlio/releases" target="_blank" rel="noopener"><button className="btn__label">Version</button><button className="btn__value">{currentversion}</button></a>
            </div>
            <h1 className="mt-40 isCentered monospace blue-text">Features</h1>
            <div className="contact__container mb-20">
                {properties.security ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.security ? "":"none ") + "center-object"} data-aos="fade-right" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072617/otlio/e91e6348157868de9dd8b25c81aebfb9_ynvmkr.webp" alt="Built-In Security" onLoad={() => handleChange('security', true)} />
                <div className="center-object full-width" data-aos="fade-left">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Built-In Security</h1>
                            <h3 className="raleway">Otlio Service Security is secure by default which uses:</h3>
                            <ul className="ul-ml40 ul-mb10 medium">
                                <li className="mt-20">Up-to-date Dependencies</li>
                                <li><a className="link" href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" target="_blank" rel="noreferrer">Advanced Encryption Standard</a> Algorithm</li>
                                <li>TLS (Transport Layer Security) and SSL (Secure Socket Layer)</li>
                                <li>Rate Limiter to Mitigate DDoS Attacks</li>
                                <li>Technology to protect app from some well-known web vulnerabilities by setting HTTP headers appropriately.</li>
                            </ul>
                        </div>
                    </CardActionArea>
                </div>
            </div>
            <div className="contact__container mb-20 gray-bg">
                <img className={(properties.cloud ? "":"none ") + "center-object phone-device"} data-aos="fade-left" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622385526/otlio/af051c89597cd018ce51bd8fd53014ff_zpl0bt.webp" alt="Reliable Services" onLoad={() => handleChange('cloud', true)} />
                <div className="center-object full-width" data-aos="fade-right">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">99% Uptime</h1>
                            <h3 className="raleway">We are committed to making our products and services accessible for everyone, everywhere, and anytime.</h3>
                            <h3 className="mt-20 raleway">Our infrastructures are configured to automatically switch to another available server when the server is down or under maintenance.</h3>
                            <h3 className="raleway mt-20">Otlio Infrastructures are hosted on:</h3>
                            <ul className="ul-ml40 ul-mb10 medium">
                                <li className="mt-20">Netlify: <a className="link" href="https://otlio.netlify.app" target="_blank" rel="noreferrer">otlio.netlify.app</a></li>
                                <li>Heroku:
                                    <ul className="medium">
                                        <li className="mt-10"><a className="link" href="https://otlio.herokuapp.com" target="_blank" rel="noreferrer">otlio.herokuapp.com</a> (US)</li>
                                        <li><a className="link" href="https://otlio-eu.herokuapp.com" target="_blank" rel="noreferrer">otlio-eu.herokuapp.com</a> (EU)</li>
                                        <li><a className="link" href="https://otlio-us.herokuapp.com" target="_blank" rel="noreferrer">otlio-us.herokuapp.com</a> (US)</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </CardActionArea>
                    <div className="footer__socialBtn col-6 mt-10" data-aos="fade-up">
                        <Tooltip title="Uptime Reports" arrow><a href="https://02zrgrp9.status.cron-job.org/" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faRocket} style={{ fontSize: "1.8em" }} />
                        </a></Tooltip>
                        <Tooltip title="Service Status" arrow><a href="https://otlio.statuspage.io/" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faChartLine} style={{ fontSize: "1.8em" }} />
                        </a></Tooltip>
                    </div>
                </div>
                {properties.cloud ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.cloud ? "":"none ") + "center-object pc-device"} data-aos="fade-left" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/af051c89597cd018ce51bd8fd53014ff_zpl0bt.webp" alt="Reliable Services" onLoad={() => handleChange('cloud', true)} />
            </div>
            <div className="contact__container mb-40">
                {properties.theme ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.theme ? "":"none ") + "center-object rounded-corner box-effect"} data-aos="fade-right" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622447717/otlio/9e1f47a80b0fee4283036db027d6e6ce_qryfyb.webp" alt="Dark Mode" onLoad={() => handleChange('theme', true)} />
                <div className="center-object full-width" data-aos="fade-left">
                    <CardActionArea>
                        <div className="p-12">
                            <h1 className="raleway mb-20">Compatible with Dark Mode</h1>
                            <h3 className="raleway">Otlio User Interface is also available in dark mode and allows user to switch smoothly between light and dark mode.</h3>
                            <h3 className="raleway mt-20">Users are also allowed to automtically switch theme according to users' preferences or single theme.</h3>
                        </div>
                    </CardActionArea>
                </div>
            </div>
            <div className="contact__container mb-20 gray-bg">
                <img className={(properties.support ? "":"none ") + "center-object phone-device"} data-aos="fade-left" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622188175/otlio/95cc64dd2825f9df13ec4ad683ecf339_ukjqzi.webp" alt="Customer Support" />
                <div className="center-object full-width" data-aos="fade-right">
                    <CardActionArea><div className="p-12">
                        <h1 className="raleway mb-20">Customer Support</h1>
                        <h3 className="raleway">We are here to help. Get in touch with us or support, let us know how we can help, and our support teams will get in touch with you as soon as possible.</h3>
                    </div></CardActionArea>
                    <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" data-aos="fade-up" href="/support">Get Support</a>
                    <div className="full-width mt-50 mb-20" data-aos="fade-left">
                        <blockquote className="quotes mb-20">Building a good customer experience doesn't happen by accident. It happens by design.</blockquote>
                        <span className="author alignRight mr-10">- Aldous Huxley</span>
                    </div>
                </div>
                {properties.support ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.support ? "":"none ") + "center-object pc-device"} data-aos="fade-left" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622188175/otlio/95cc64dd2825f9df13ec4ad683ecf339_ukjqzi.webp" alt="Customer Support" onLoad={() => handleChange('support', true)} />
            </div>
            <div className="contact__container mb-40">
                {properties.theme ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.github ? "":"none ") + "center-object"} data-aos="fade-right" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/589612f86db2a2b483b007bc2a1e9665_db0zwi.webp" alt="Open Source Project" onLoad={() => handleChange('github', true)} />
                <div className="center-object full-width" data-aos="fade-left">
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
                    <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" data-aos="fade-up" href="https://github.com/stanleyowen/otlio" target="_blank" rel="noopener">View Code on GitHub</a>
                </div>
            </div>
            <footer className="footer">
				<div>
                    <div className="mb-40 col">
                        <nav className="col">
                            <div className="monospace mb-10">Resources</div>
                            <ul className="no-dots margin10 font-default small">
                                <li><a href="/login">Login</a></li>
                                <li><a href="/get-started">Get Started</a></li>
                                <li><a href="https://github.com/stanleyowen/otlio">GitHub</a></li>
                            </ul>
                        </nav>
                        <nav className="col">
                            <div className="monospace mb-10">Support</div>
                            <ul className="no-dots margin10 font-default small">
                                <li><a href="https://otlio.statuspage.io/">Service Status</a></li>
                                <li><a href="https://02zrgrp9.status.cron-job.org/">Uptime Report</a></li>
                                <li><a href="http://localhost:3000/support">Contact Us</a></li>
                            </ul>
                        </nav>
                    </div>
                    <ul className="monospace">
                        <li className="inline"><span className="font-default bold">&copy;</span> 2021 Otlio</li>
                        <li className="inline ml-20"><a href="/terms-and-conditions">Terms</a></li>
                        <li className="inline ml-20"><a href="/privacy-policy">Privacy</a></li>
                    </ul>
                </div>
			</footer>
        </div>
    )
}

export default Landing