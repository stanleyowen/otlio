import aos from 'aos'
import axios from 'axios'
import 'aos/dist/aos.css'
import React, { useEffect, useState } from 'react'
import Skeleton from '@material-ui/lab/Skeleton'
import { CardActionArea } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDraftingCompass, faFingerprint, faMoon, faSyncAlt } from '@fortawesome/free-solid-svg-icons'

import Images from '../libraries/image'
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const GITHUB_API = "https://api.github.com/repos/stanleyowen/otlio"

const Landing = () => {
    const version = document.querySelector('meta[name="version"]').content
    const [data, setData] = useState({
        stars: '',
        license: ''
    })
    const [properties, setProperties] = useState({
        organizingEasier: false,
        security: false,
        cloud: false,
        github: false,
        support: false,
    })

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })

    useEffect(() => {
        async function getRepoInfo() {
            await axios.all([axios.get(GITHUB_API), axios.get(`${GITHUB_API}/releases`)])
            .then(res => {
                var latestVersion = res[1].data[0].tag_name.slice(1)
                setData({
                    stars: res[0].data.stargazers_count,
                    license: res[0].data.license.spdx_id
                })
                if(version !== latestVersion) setNotification(NOTIFICATION_TYPES.WARNING, `Version ${latestVersion} is available`)
            })
            .catch(err => {
                if(err.response.data.message) setNotification(NOTIFICATION_TYPES.DANGER, `Error: ${err.response.data.message}`)
                else setNotification(NOTIFICATION_TYPES.DANGER, "Error in Fetching GitHub Data")
            })
        }
        if(version) getRepoInfo()
    },[version])

    useEffect(() => {
        const stars = document.getElementById('stars')
        async function countAnimation() {
            ['stars', 'viewer', 'cloner'].forEach(a => {
                let i = 0
                const element = document.getElementById(a)
                const data = element.getAttribute(`data-${a}`)
                async function updateValue() {
                    if(i >= data) return
                    i = i + (data > 400 ? Math.round(data/200) : data > 200 ? 10 : data > 25 ? 2 : 1)
                    if(i > data) i = data
                    setTimeout(() => {
                        element.innerText=i
                        updateValue()
                    }, data < 50 ? 300 : data < 500 ? 30 : 15)
                }
                updateValue()
            })
        }

        if(stars && stars.getAttribute('data-stars')) {
            if (!window.IntersectionObserver) countAnimation()
            else {
                const observer = new IntersectionObserver(async a => {
                    // Unobserve the element as soon as the threshold is reached
                    if(a[0].isIntersecting === true) {
                            countAnimation();
                            observer.unobserve(document.getElementById('counter'))
                        }
                }, { threshold: [1] })
                observer.observe(document.getElementById('counter'));
            }
        }
    }, [data.stars])

    useEffect(() => {
        aos.init()
        var x = 0; var index = 0; var interval
        const element = document.querySelector('.text-animation')
        const data = element.getAttribute('data-elements').split(',')
        async function type() {
            const text = data[x].substring(0, index+1)
            element.innerText = text
            index++
            if(text === data[x]) {
                clearInterval(interval)
                setTimeout(() => interval = setInterval(backspace, 15), 1000)
            }
        }
        async function backspace() {
            const text = data[x].substring(0, index-1)
            element.innerText = text
            index--
            if(text === '') {
                index = 0
                clearInterval(interval)
                x === (data.length-1) ? x=0 : x++
                setTimeout(() => interval = setInterval(type, 80), 100)
            }
        }
        interval = setInterval(type, 80)
    }, [])

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
                    {properties.organizingEasier ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.organizingEasier ? "":"none ") + "center-object"} src={Images.organizingEasier} alt="Organzing Easier" onLoad={() => handleChange('organizingEasier', true)} onError={e => { e.target.src=Images.localOrganizingEasier }} />
                </div>
            </div>
            <div className="isCentered badges mt-40 mb-40">
                <a href="https://github.com/stanleyowen/otlio/stargazers" target="_blank" rel="noopener"><button className="btn__label">Stars</button><button className="btn__value">{data.stars}</button></a>
                <a href="https://github.com/stanleyowen/otlio/blob/master/LICENSE" target="_blank" rel="noopener"><button className="btn__label">License</button><button className="btn__value">{data.license}</button></a>
                <a href="https://github.com/stanleyowen/otlio/releases" target="_blank" rel="noopener"><button className="btn__label">Version</button><button className="btn__value">{version}</button></a>
            </div>
            <h1 className="mt-40 isCentered monospace blue-text">Features</h1>
            <div id="feature">
                <div className="contact__container mb-20">
                    {properties.security ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.security ? "":"none ") + "center-object"} data-aos="fade-right" src={Images.security} alt="Built-In Security" onLoad={() => handleChange('security', true)} onError={e => { e.target.src=Images.localSecurity }} />
                    <div className="center-object full-width" data-aos="fade-left">
                        <CardActionArea className="rounded-corner">
                            <div className="p-12">
                                <h1 className="raleway mb-20 blue-text">Security and Privacy</h1>
                                <h3 className="raleway">
                                    We provide a secure environment for everyone to our services with:
                                    <ul className="ul-ml40 ul-mb10 medium">
                                        <li className="mt-10"><span className="blue-text">Encryption Algorithm</span> such as HTTPS technology and Transport Layer Security</li>
                                        <li><span className="blue-text">Rate Limiting Algorithm</span> to prevent DDoS and minimizing end-to-end latency across large distributed systems</li>
                                        <li><span className="blue-text">Enhanced Database Protection</span></li>
                                        <li><span className="blue-text">Security Alerts</span></li>
                                    </ul>
                                </h3>
                            </div>
                        </CardActionArea>
                    </div>
                </div>
                <div className="contact__container mb-20 gray-bg">
                    <img className={(properties.cloud ? "":"none ") + "center-object phone-device"} data-aos="fade-left" src={Images.cloud} alt="Reliable Services" onLoad={() => handleChange('cloud', true)} onError={e => { e.target.src=Images.localCloud }} />
                    <div className="center-object full-width" data-aos="fade-right">
                        <CardActionArea className="rounded-corner">
                            <div className="p-12">
                                <h1 className="raleway mb-20 blue-text">99% Uptime</h1>
                                <h3 className="raleway">We are committed to making our products and services <span className="blue-text">accessible for everyone</span> with 99% uptime and three-way servers to improve our services.</h3>
                                <h3 className="mt-20 raleway">Our infrastructures are configured to automatically switch to another available server in range when one server is down or under maintenance.</h3>
                            </div>
                        </CardActionArea>
                        <a className="oauth-box outline-blue isCentered block mt-20 mb-20 p-12 button monospace" data-aos="fade-up" href="https://otlio.statuspage.io/" target="_blank" rel="noopener">Service Status</a>
                        <a className="oauth-box outline-blue isCentered block mt-20 mb-20 p-12 button monospace" data-aos="fade-up" href="https://02zrgrp9.status.cron-job.org/" target="_blank" rel="noopener">Uptime Reports</a>
                    </div>
                    {properties.cloud ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.cloud ? "":"none ") + "center-object pc-device"} data-aos="fade-left" src={Images.cloud} alt="Reliable Services" onLoad={() => handleChange('cloud', true)} onError={e => { e.target.src=Images.localCloud }} />
                </div>
                <div className="contact__container mb-20">
                    {properties.github ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.github ? "":"none ") + "center-object"} data-aos="fade-right" src={Images.github} alt="Open Source Project" onLoad={() => handleChange('github', true)} onError={e => { e.target.src=Images.localGithub }} />
                    <div className="center-object full-width" data-aos="fade-left">
                        <CardActionArea className="rounded-corner">
                            <div className="p-12">
                                <h1 className="raleway mb-20 blue-text">Open Source Project</h1>
                                <h3 className="raleway">Otlio is an open source project which is hosted publicly on <span className="blue-text">GitHub</span>.</h3>
                            </div>
                        </CardActionArea>
                        <table className="table-col-3 monospace no-border full-width block h2" cellPadding="0" cellSpacing="0" data-aos="fade-right" id="counter">
                            <thead><tr>
                                <td className="isCentered">Stars</td>
                                <td className="isCentered">Monthly Viewers</td>
                                <td className="isCentered">Monthly Cloners</td>
                            </tr></thead>
                            <tbody><tr style={{background: 'none'}}>
                                <td className="isCentered" id="stars" data-stars={data.stars}>N/A</td>
                                <td className="isCentered">
                                    <span id="viewer" data-viewer="6192">N/A</span>
                                    <sup className="small required">*</sup>
                                </td>
                                <td className="isCentered">
                                    <span id="cloner" data-cloner="384">N/A</span>
                                    <sup className="small required">*</sup>
                                </td>
                            </tr></tbody>
                            <span className="required small">* As of 17 June 2021</span>
                        </table>
                        <a className="oauth-box outline-blue isCentered block mt-20 mb-20 p-12 button monospace" data-aos="fade-up" href="https://github.com/stanleyowen/otlio" target="_blank" rel="noopener">View Code on GitHub</a>
                    </div>
                </div>
                <div className="contact__container mb-40 gray-bg">
                    <img className={(properties.support ? "":"none ") + "center-object phone-device"} data-aos="fade-left" src={Images.support} alt="Customer Support" onError={e => { e.target.src=Images.localSupport }} />
                    <div className="center-object full-width" data-aos="fade-right">
                        <CardActionArea className="rounded-corner"><div className="p-12">
                            <h1 className="raleway mb-20 blue-text">Customer Support</h1>
                            <h3 className="raleway">We are here to help. <span className="blue-text">Get in touch</span> with us or <span className="blue-text">support</span>, let us know how we can help, and our support teams will get in touch with you as soon as possible.</h3>
                        </div></CardActionArea>
                        <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" data-aos="fade-up" href="/support">Get Support</a>
                        <div className="full-width mt-50 mb-20" data-aos="fade-left">
                            <blockquote className="quotes mb-20">Building a good customer experience doesn't happen by accident. It happens by design.</blockquote>
                            <span className="author alignRight mr-10">- Aldous Huxley</span>
                        </div>
                    </div>
                    {properties.support ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="100%" />} <img className={(properties.support ? "":"none ") + "center-object pc-device"} data-aos="fade-left" src={Images.support} alt="Customer Support" onLoad={() => handleChange('support', true)} onError={e => { e.target.src=Images.localSupport }} />
                </div>
            </div>
            <div className="projects__container" id="additional-feature" data-aos="fade-down">
                <div className="m-10">
                    <div className="projects__card">
                        <div className="blue-text flex">
                            <FontAwesomeIcon className="col isCentered blue-text" icon={faFingerprint} size="3x" />
                            <p className="h2 col monospace m-auto">2FA (Two Factor Authentication)</p>
                        </div>
                        <p className="raleway mt-10 p-12">A security control that requires users to verify their identities before gaining access.</p>
                    </div>
                </div>
                <div className="m-10">
                    <div className="projects__card">
                        <div className="blue-text flex">
                            <FontAwesomeIcon className="col isCentered blue-text" icon={faSyncAlt} size="3x" />
                            <p className="h2 col monospace m-auto">Continuous Updates</p>
                        </div>
                        <p className="raleway mt-10 p-12">We continually deploy improvements, bug fixes, updates, and new features.</p>
                    </div>
                </div>
                <div className="m-10">
                    <div className="projects__card">
                        <div className="blue-text flex">
                            <FontAwesomeIcon className="col isCentered blue-text" icon={faDraftingCompass} size="3x" />
                            <p className="h2 col monospace m-auto">Drag and Drop</p>
                        </div>
                        <p className="raleway mt-10 p-12">Simply drag the task and drop onto the desired position!</p>
                    </div>
                </div>
                <div className="m-10">
                    <div className="projects__card">
                        <div className="blue-text flex">
                            <FontAwesomeIcon className="col isCentered blue-text" icon={faMoon} size="3x" />
                            <p className="h2 col monospace m-auto">Light and Dark UI</p>
                        </div>
                        <p className="raleway mt-10 p-12">Choose how Otlio looks to you, smoothly switch between light and dark mode.</p>
                    </div>
                </div>
            </div>
            <footer className="footer">
                <div className='oauth-container mt-10'>
                    <a href="https://www.netlify.com">
                        <img src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg" alt="Deploys by Netlify" />
                    </a>
                </div>
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
                                <li><a href="/support">Contact Us</a></li>
                            </ul>
                        </nav>
                    </div>
                    <ul className="monospace">
                        <li className="inline"><span className="font-default bold">&copy;</span> 2023 Otlio</li>
                        <li className="inline ml-20"><a href="/terms-and-conditions">Terms</a></li>
                        <li className="inline ml-20"><a href="/privacy-policy">Privacy</a></li>
                    </ul>
                </div>
			</footer>
        </div>
    )
}

export default Landing