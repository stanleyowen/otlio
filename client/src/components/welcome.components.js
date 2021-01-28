import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GITHUB_API = process.env.REACT_APP_GITHUB_API;

const Landing = () => {
    const [star, setStar] = useState('');
    const [license, setLicense] = useState('');
    useEffect(() => {
        async function getRepoInfo() {
            await axios.get(`${GITHUB_API}`)
            .then(res => {
                if(res && res.status <= 226){ setStar(res.data.stargazers_count); setLicense(res.data.license.spdx_id) }
                else { setStar('Err'); setLicense('Err') };
            })
            .catch(err => console.log(err));
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