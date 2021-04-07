import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';

const GITHUB_API = "https://api.github.com/repos/stanleyowen/todo-application";

const Landing = () => {
    const [repoInfo, setRepoInfo] = useState([]);
    const currentversion = process.env.REACT_APP_VERSION;

    useEffect(() => {
        async function getRepoInfo() {
            await axios.get(GITHUB_API)
            .then(async res => {
                setRepoInfo([res.data.stargazers_count, res.data.license.spdx_id])
                await axios.get(`${GITHUB_API}/releases`)
                .then(res => {
                    let latestVersion =  res.data[0] ? res.data[0].tag_name.slice(1) : '1.0.0';
                    if(currentversion !== latestVersion) setNotification(NOTIFICATION_TYPES.WARNING, `Version ${latestVersion} is available`)
                })
                .catch(err => {
                    if(err.response.data.message) setNotification(NOTIFICATION_TYPES.DANGER, 'ERR: '+err.response.data.message)
                    else setNotification(NOTIFICATION_TYPES.DANGER, "ERR: Couldn't Check for Updates")
                });
            })
            .catch(err => {
                if(err.response.data.message) setNotification(NOTIFICATION_TYPES.DANGER, 'ERR: '+err.response.data.message)
                else setNotification(NOTIFICATION_TYPES.DANGER, "ERR: Invalid API")
            });
        }
        getRepoInfo();
    },[currentversion]);
    
    return (
        <div>
            <div className="main isCentered">
                <h1 className="main__title">Organizing Easier</h1><h1 style={{fontSize: '50px'}}>Improve Your <span className="green__text">Productivity</span></h1>
                <a href="get-started" className="btn__outline">Get Started</a>
            </div>
            <div className="isCentered badges">
                <a href="https://github.com/stanleyowen/todo-application/"><button className="btn__label">Stars</button><button className="btn__value">{repoInfo[0]}</button></a>
                <a href="https://github.com/stanleyowen/todo-application/stargazers"><button className="btn__label">License</button><button className="btn__value">{repoInfo[1]}</button></a>
                <a href="https://github.com/stanleyowen/todo-application/releases"><button className="btn__label">Version</button><button className="btn__value">{currentversion}</button></a>
            </div>
        </div>
    );
}

export default Landing;