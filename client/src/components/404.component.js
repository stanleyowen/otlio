import React from 'react'
import { Tooltip } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faChartLine } from '@fortawesome/free-solid-svg-icons'

const PageNotFound = ({ userData }) => {
    return (
        <div className="main">
            <div className="contact__container">
                <img className="center-object" src="https://res.cloudinary.com/stanleyowen/image/upload/v1622072616/otlio/4f4adcbf8c6f66dcfc8a3282ac2bf10a_svidxs.webp" alt="Page Not Found" />
                <div className="center-object">
                    <h1 className="blue-text monospace large">404</h1>
                    <h1 className="blue-text monospace">Page Not Found</h1>
                    <h3 className="mt-20 monospace">Oops! We are sorry, we can't find the page you were looking for.</h3>
                    <h3 className="mt-20 monospace">If you're experiencing a critical issue, please <a className="animation__underline" href="/support">contact support</a>.</h3>
                    <a className="oauth-box outline-blue isCentered block mt-30 mb-20 p-12 button monospace" href={userData.authenticated ? '/':'/welcome'}>Back to Home</a>
                    <div className="footer__socialBtn mb-20">
                        <Tooltip title="Contact Support" arrow><a href="/support" rel="noopener">
                            <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "1.8em" }} />
                        </a></Tooltip>
                        <Tooltip title="Current Status" arrow><a href="https://otlio.statuspage.io/" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faChartLine} style={{ fontSize: "1.8em" }} />
                        </a></Tooltip>
                        <Tooltip title="View Code on GitHub" arrow><a href="https://github.com/stanleyowen/otlio/" target="_blank" rel="noopener">
                            <FontAwesomeIcon icon={faGithub} style={{ fontSize: "1.8em" }} />
                        </a></Tooltip>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PageNotFound