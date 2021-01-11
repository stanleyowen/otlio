import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cookies from 'universal-cookie';
import getUserToken from '../library/getUserToken';

const Landing = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');

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
    
    const Submit = (e) => {
        e.preventDefault();
        const User = { username, password }
        axios.post('http://localhost:5000/user/login', User)
        .then(res => {
            cookies.save('token', res.data, {path: '/'});
            window.location = '/dashboard';
        })
        .catch(err => setErrMsg("Invalid Credentials"));
    }

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
                    <a className="animation__underline" href="#home">Home</a>
                    <a className="animation__underline" href="#about">About</a>
                    <a className="animation__underline" href="#projects">Achievements</a>
                    <a className="animation__underline" href="contact/">Contact Stanley</a>
                </div>
                <a href="#!" className="toggleNavbar" onClick={toggleNavbar}><i className="fa fa-bars"></i></a>
            </div>
		    <button className="btn__changeMode" aria-label="Change Mode" onClick={changeMode}><i className="fas fa-adjust" style={{fontSize: '2em'}}></i></button>
        </div>
    );
}
export default Landing;