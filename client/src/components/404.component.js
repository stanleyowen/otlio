import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import Image from '../img/4f4adcbf8c6f66dcfc8a3282ac2bf10a.webp'

const Landing = ({ userData }) => {
    return (
        <div className="main">
            <div className="contact__container">
                <img src={Image} className=""/>
                <div className="center-vertical p-50">
                    <h1>404 - Page Not Found</h1>
                    <h2 className="mt-20">We're sorry, we couldn't find the page you requested.</h2>
                    <button className="oauth-box google isCentered block mt-30 mb-20 p-12 button" onClick={() => userData.authenticated ? window.location='/' : window.location='/welcome'}>Back</button>
                    <div class="footer__socialBtn">
                        <a href="mailto:stanleyowen06@gmail.com">
                            <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "1.8em" }} />
                        </a>
                        <a href="https://github.com/stanleyowen">
                            <FontAwesomeIcon icon={faGithub} style={{ fontSize: "1.8em" }} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing