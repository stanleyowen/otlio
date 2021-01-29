import React, { useEffect, useState } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../library/setNotification';
import axios from 'axios';

const GITHUB_API = "https://api.github.com/repos/stanleyowen/todo-application";

const Landing = () => {
    const [star, setStar] = useState('');
    const [license, setLicense] = useState('');
    useEffect(() => {
        async function getRepoInfo() {
            await axios.get(`${GITHUB_API}`)
            .then(res => {
                if(res && res.data.stargazers_count && res.data.license.spdx_id){
                    setStar(res.data.stargazers_count);
                    setLicense(res.data.license.spdx_id);
                }
            })
            .catch(err => {
                if(err && err.response.data.message){
                    setNotification(NOTIFICATION_TYPES.DANGER, 'ERR: '+err.response.data.message);
                    setStar('Err'); setLicense('Err');
                }else {
                    setNotification(NOTIFICATION_TYPES.DANGER, "ERR: Invalid API");
                    setStar('Err'); setLicense('Err');
                }
            });
        }
        getRepoInfo();
    },[]);
    
    return (
        <div>
            <div className="main isCentered">
                <h1 className="main__title">Organizing Easier</h1><h1 style={{fontSize: '50px'}}>Improve Your <span className="green__text">Productivity</span></h1>
                <a href="get-started" className="btn__outline">Get Started</a>
            </div>
            <div className="isCentered badges">
                <a href="https://github.com/stanleyowen/TodoApp/"><button className="btn__label">License</button><button className="btn__value">{license}</button></a>
                <a href="https://github.com/stanleyowen/TodoApp/stargazers"><button className="btn__label">Stars</button><button className="btn__value">{star}</button></a>
            </div>
        </div>
    );
}

export default Landing;