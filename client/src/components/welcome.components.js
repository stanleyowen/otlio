import React, { useEffect, useState } from 'react';
import cookies from 'universal-cookie';
import getUserToken from '../library/getUserToken';
import axios from 'axios';

const GITHUB_API = process.env.REACT_APP_GITHUB_API;
const Landing = () => {
    const [star, setStar] = useState(''); 
    useEffect(() => {
        const token = new cookies().get('token');
        getUserToken(token)
        .then(res => {
            if(res && !res.status){
                const token = new cookies();
                token.set('token', res.token, {path: '/', maxAge: 604800});
                window.location = '/';
            }
        })
    },[]);

    const toggleNavbar = (e) => {
        e.preventDefault();
        var menu = document.getElementById("navbar__menu");
        if(menu.style.display === "block"){
            menu.style.display = "none";
        }else {
            menu.style.display = "block";
        }
    }

    const changeMode = (e) => {
        e.preventDefault();
        document.body.classList.toggle("dark");
        let theme = "light";
        if(document.body.classList.contains("dark")){
            theme = "dark";
        }
        localStorage.setItem("theme", theme);
    }
    
    return (
        <div>
            <div id="loader-wrapper">
                <div id="loader"></div>
                <div className="loader-section section-left"></div>
                <div className="loader-section section-right"></div>
            </div>
            <div className="navbar">
                <a className="navbar__logo" href="/">TodoApp</a>
                <div className="navbar__menu" id="navbar__menu">
                    <a className="animation__underline" href="#projects">Login</a>
                    <a className="animation__underline" href="contact/">Get Started</a>
                </div>
                <a href="#!" className="toggleNavbar" onClick={toggleNavbar}><i className="fa fa-bars"></i></a>
            </div>
            <div className="main isCentered">
                <h1 className="main__title">Organizing Easier</h1><h1 style={{fontSize: '50px'}}>Improve Your <span className="green__text">Productivity</span></h1>
                <a href="get-started" className="btn__outline">Get Started</a>
            </div>
            <div className="isCentered badges">
                <a href="https://github.com/stanleyowen/TodoApp/"><img src="https://img.shields.io/github/license/stanleyowen/TodoApp" alt="License" /></a>
                <a href="https://github.com/stanleyowen/TodoApp/stargazers"><img src="https://img.shields.io/github/stars/stanleyowen/TodoApp" alt="Stars" /></a>
            </div>
		    <button className="btn__changeMode" aria-label="Change Mode" onClick={changeMode}><i className="fas fa-adjust" style={{fontSize: '2em'}}></i></button>
        </div>
    );
}

export default Landing;