import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdjust, faSignOutAlt, faUser, faListUl, faSignInAlt, faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons/';

import { Logout } from '../libraries/validation';

const Navbar = ({ userData }) => {
    const {email, id, authenticated, isLoading} = userData;
    const theme = localStorage.getItem('__theme')
    const [value_a, setValue_a] = useState([]);
    const [value_b, setValue_b] = useState([]);
    const [value_c, setValue_c] = useState();
    
    useEffect(() => {
        if(theme === "dark") document.body.classList.add("dark");
        if(!isLoading && authenticated){
            setValue_a([`Dashboard`,'/', <FontAwesomeIcon icon={faListUl} style={{ fontSize: "1.5em" }} />]);
            setValue_b([`Sign Out`,'#!', <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: "1.5em" }} />, () => Logout(id, email)]);
            setValue_c([`Account Settings`,'/account', <FontAwesomeIcon icon={faUser} style={{ fontSize: "1.4em" }} />]);
        }else {
            setValue_a(['Login','/login', <FontAwesomeIcon icon={faSignInAlt} style={{ fontSize: "1.5em" }} />]);
            setValue_b(['Get Started','/get-started', <FontAwesomeIcon icon={faUsers} style={{ fontSize: "1.5em" }} />]);
        }
    },[userData, theme]);

    const toggleNavbar = (e) => {
        e.preventDefault();
        var menu = document.getElementById("navbar__menu");
        var icon = document.getElementById("navbar-icon");
        icon.classList.toggle("closeIcon");
        if(menu.style.display === "block") menu.style.display = "none";
        else menu.style.display = "block";
    }

    const changeMode = (e) => {
        e.preventDefault();
        let theme = "light";
        document.body.classList.toggle("dark");
        if(document.body.classList.contains("dark")) theme = "dark";
        localStorage.setItem("__theme", theme);
    }

    return (
        <div>
            <div className="navbar">
                <a className="navbar__logo" href={ authenticated ? '/' : '/welcome' }>TodoApp</a>
                <div className="navbar__menu" id="navbar__menu">
                    <a className="animation__underline" href={value_a[1]}>
                        <span className="icons">
                            <Tooltip title={value_a[0] ? value_a[0]:""}><span>{value_a[2]}</span></Tooltip>
                        </span>
                        <span className="description">{value_a[0]}</span>
                    </a>
                    {value_c ? (
                        <a className="animation__underline" id={value_c[0]} href={value_c[1]}>
                        <span className="icons">
                            <Tooltip title={value_c[0] ? value_c[0]:""}><span>{value_c[2]}</span></Tooltip>
                        </span>
                        <span className="description">{value_c[0]}</span>
                    </a>) : null}
                    <a className="animation__underline" href="https://todoapp.freshstatus.io/" target="_blank" rel="noopener noreferrer">
                        <span className="icons">
                            <Tooltip title="Status">
                                <span><FontAwesomeIcon icon={faChartLine} style={{ fontSize: "1.5em" }} /></span>
                            </Tooltip>
                        </span>
                        <span className="description">Status</span>
                    </a>
                    <a className="animation__underline" id={value_b[0]} href={value_b[1]} onClick={value_b[3]}>
                        <span className="icons"><Tooltip title={value_b[0] ? value_b[0]:""}><span>{value_b[2]}</span></Tooltip></span>
                        <span className="description">{value_b[0]}</span>
                    </a>
                </div>
                <div className="toggleNavbar">
                    <Tooltip title="Menu">
                        <IconButton onClick={toggleNavbar}>
                            <div className="container-bar" id="navbar-icon">
                                <div className="bar1"></div>
                                <div className="bar2"></div>
                                <div className="bar3"></div>
                            </div>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
		    <Tooltip title="Change Mode">
                <button className="btn__changeMode" aria-label="Change Mode" onClick={changeMode}>
                    <FontAwesomeIcon icon={faAdjust} size="2x"/>
                </button>
            </Tooltip>
            <a href="https://github.com/stanleyowen/todo-application" target="_blank" rel="noreferrer noopener" className="github-corner" aria-label="View Source Code on GitHub">
                <svg width="80" height="80" viewBox="0 0 250 250" style={{ fill: '#64CEAA', color: '#fff', position: 'fixed', bottom: '0', border: '0', left: '0', transform: 'scale(-1, -1)' }} aria-hidden="true">
                    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
                    <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{ transformOrigin: '130px 106px' }} className="octo-arm"></path>
                    <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body"></path>
                </svg>
            </a>
        </div>
    );
}

export default Navbar;