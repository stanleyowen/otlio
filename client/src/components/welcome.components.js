import React, { useEffect, useState } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../library/setNotification';
import axios from 'axios';

const GITHUB_API = "https://api.github.com/repos/stanleyowen/todo-application";

const Landing = () => {
    const [repoInfo, setRepoInfo] = useState([]);
    const currentversion = process.env.REACT_APP_VERSION;

    useEffect(() => {
        async function getRepoInfo() {
            await axios.get(GITHUB_API)
            .then(res => setRepoInfo([res.data.stargazers_count, res.data.license.spdx_id]))
            .catch(err => {
                if(err.response.data.message) setNotification(NOTIFICATION_TYPES.DANGER, 'ERR: '+err.response.data.message)
                else setNotification(NOTIFICATION_TYPES.DANGER, "ERR: Invalid API")
            });
        }
        async function getLatestVersion() {
            await axios.get(`${GITHUB_API}/releases`)
            .then(res => {
                if(res.data[0].tag_name){
                    let latestVersion =  res.data[0].tag_name.substring(1);
                    if(currentversion !== latestVersion) setNotification(NOTIFICATION_TYPES.WARNING, `Version ${latestVersion} is available`)
                }
            })
            .catch(err => {
                if(err.response.data.message) setNotification(NOTIFICATION_TYPES.DANGER, 'ERR: '+err.response.data.message)
                else setNotification(NOTIFICATION_TYPES.DANGER, "ERR: Couldn't Check for Updates")
            });
        }
        getRepoInfo();
        getLatestVersion();
    },[currentversion]);
    
    return (
        <div>
            <div className="main isCentered">
                <h1 className="main__title">Organizing Easier</h1><h1 style={{fontSize: '50px'}}>Improve Your <span className="green__text">Productivity</span></h1>
                <a href="get-started" className="btn__outline">Get Started</a>
            </div>
            <div className="isCentered badges">
                <a href="https://github.com/stanleyowen/TodoApp/"><button className="btn__label">License</button><button className="btn__value">{repoInfo[0]}</button></a>
                <a href="https://github.com/stanleyowen/TodoApp/stargazers"><button className="btn__label">Stars</button><button className="btn__value">{repoInfo[1]}</button></a>
                <a href="https://github.com/stanleyowen/todo-application/releases"><button className="btn__label">Version</button><button className="btn__value">{currentversion}</button></a>
            </div>
        </div>
    );
}

export default Landing;