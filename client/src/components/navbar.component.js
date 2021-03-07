/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import getUserToken from '../libraries/getUserToken';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdjust, faPlus, faSignOutAlt, faKey, faHome, faSignInAlt, faUsers } from '@fortawesome/free-solid-svg-icons/';
import { setNotification, NOTIFICATION_TYPES, setWarning } from '../libraries/setNotification';
import axios from 'axios';

/* Icons */
import { IconButton, Tooltip } from '@material-ui/core';
import { Menu } from '@material-ui/icons';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const redirectRoute = ['welcome', 'login', 'get-started'];
const privateRoute = ['', 'edit'];

const Navbar = () => {
    const location = useLocation();
    const email = localStorage.getItem('__email');
    const releaseNotification = localStorage.getItem('__release');
    const [value_a, setValue_a] = useState([]);
    const [value_b, setValue_b] = useState([]);
    const [value_c, setValue_c] = useState();
    const [value_d, setValue_d] = useState(false);
    const [oldPassword, setOldPassword] = useState();
    const [newPassword, setNewPassword] = useState();
    const [confirmPsw, setConfirmPsw] = useState();
    const [visible, setVisible] = useState(false);
    
    useEffect(() => {
        async function getToken() {
            const userData = {
                token: localStorage.getItem('__token'),
                userId: localStorage.getItem('__id'),
                theme: localStorage.getItem('__theme')
            }
            if(userData.theme === "dark") document.body.classList.add("dark");
            if(userData.token && userData.userId){
                getUserToken(userData.token, userData.userId)
                .then(res => {
                    if(res){
                        localStorage.setItem('__email', res.email);
                        setValue_a([`Dashboard`,'/', <FontAwesomeIcon icon={faHome} style={{ fontSize: "1.5em" }} />]);
                        setValue_b([`Logout`,'#!', <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: "1.5em" }} />, Logout]);
                        setValue_c([`Change Password`,'#!', <FontAwesomeIcon icon={faKey} style={{ fontSize: "1.4em" }} />, changePasswordModal]);
                        setValue_d(<FontAwesomeIcon icon={faPlus} style={{ fontSize: "2.2em" }} />)
                        redirectRoute.forEach(a => {
                            if(location.pathname.split('/')[1] === a) window.location='/';
                        });
                    }else {
                        setValue_a(['Login','/login', <FontAwesomeIcon icon={faSignInAlt} style={{ fontSize: "1.5em" }} />]);
                        setValue_b(['Get Started','/get-started', <FontAwesomeIcon icon={faUsers} style={{ fontSize: "1.5em" }} />]);
                        let itemsToRemove = ["__token", "__email", "__id"];
                        itemsToRemove.forEach(a => localStorage.removeItem(a));
                        privateRoute.forEach(a => {
                            if(location.pathname.split('/')[1] === a) window.location='/welcome';
                        });
                    }
                })
            }else {
                setValue_a([`Login`,'/login', <FontAwesomeIcon icon={faSignInAlt} style={{ fontSize: "1.5em" }} />]);
                setValue_b([`Get Started`,'/get-started', <FontAwesomeIcon icon={faUsers} style={{ fontSize: "1.5em" }} />]);
                privateRoute.forEach(a => {
                    if(location.pathname.split('/')[1] === a) window.location='/welcome';
                });
            }
        }
        const modal = document.getElementById('changePasswordModal');
        window.onclick = function(e){
            if(e.target === modal){
                modal.style.visibility = "hidden";
                modal.style.opacity = "0";
            }
        }
        getToken();
        setWarning();
    },[location]);

    const submitNewPassword = (e) => {
        e.preventDefault();
        const id = localStorage.getItem('__id');
        const token = localStorage.getItem('__token');
        const btn = document.getElementById('btn-changePassword');
        async function submitData() {
            btn.innerHTML = "Changing Password...";
            const modal = document.getElementById('changePasswordModal');
            const postData = { email, oldPassword, newPassword, confirmPsw, id, token }
            await axios.post(`${SERVER_URL}/data/accounts/changePassword`, postData)
            .then(res => {setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message); localStorage.setItem('__token', res.data.token)})
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            modal.style.visibility = "hidden";
            modal.style.opacity = "0";
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Change Password";
            setOldPassword(''); setNewPassword(''); setConfirmPsw('');
        }
        if(!email) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else if(!oldPassword || !newPassword || !confirmPsw) setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !")
        else if(oldPassword.length < 6 || newPassword.length < 6 || oldPassword.length > 40 || newPassword.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById('old-password').focus(); }
        else if(newPassword !== confirmPsw) { setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('new-password').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    const Logout = async (e) => {
        e.preventDefault();
        const id = localStorage.getItem('__id');
        const token = localStorage.getItem('__token');
        await axios.get(`${SERVER_URL}/data/accounts/logout`, {params: {id, token}, headers: { Authorization: `JWT ${token}` }})
        .then(() => {
            let itemsToRemove = ["__token", "__email", "__id"];
            itemsToRemove.forEach(a => localStorage.removeItem(a));
            window.location = '/login';
        })
    }

    const addTodo = (e) => {
        e.preventDefault();
        const modal = document.getElementById('addTodoModal');
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
    }

    const changePasswordModal = (e) => {
        e.preventDefault();
        const modal = document.getElementById('changePasswordModal');
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
    }

    const closeModal = (e) => {
        e.preventDefault();
        const modal = document.getElementById('changePasswordModal');
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
    }

    const toggleNavbar = (e) => {
        e.preventDefault();
        var menu = document.getElementById("navbar__menu");
        if(menu.style.display === "block"){ menu.style.display = "none"; }
        else{ menu.style.display = "block"; }
    }

    const closeWarning = (e) => {
        e.preventDefault();
        const notification = document.getElementById('release-notification');
        localStorage.setItem('__release', true)
        notification.classList.add('hide');
    }

    const changeMode = (e) => {
        e.preventDefault();
        document.body.classList.toggle("dark");
        let theme = "light";
        if(document.body.classList.contains("dark")){
            theme = "dark";
        }
        localStorage.setItem("__theme", theme);
    }

    return (
        <div>
            <div className="navbar">
                <a className="navbar__logo" href={ value_c ? '/' : '/welcome' }>TodoApp</a>
                <div className="navbar__menu" id="navbar__menu">
                    <a className="animation__underline" href={value_a[1]}>
                        <span className="icons">
                            <Tooltip title={value_a[0] ? value_a[0]:""}><span>{value_a[2]}</span></Tooltip>
                        </span>
                        <span className="description">{value_a[0]}</span>
                    </a>
                    {value_c ? (
                        <a className="animation__underline" id={value_c[0]} href={value_c[1]} onClick={value_c[3]}>
                        <span className="icons">
                            <Tooltip title={value_c[0] ? value_c[0]:""}><span>{value_c[2]}</span></Tooltip>
                        </span>
                        <span className="description">{value_c[0]}</span>
                    </a>) : null}
                    <a className="animation__underline" id={value_b[0]} href={value_b[1]} onClick={value_b[3]}>
                        <span className="icons">
                            <Tooltip title={value_b[0] ? value_b[0]:""}><span>{value_b[2]}</span></Tooltip>
                        </span>
                        <span className="description">{value_b[0]}</span>
                    </a>
                </div>
                <div className="toggleNavbar">
                    <Tooltip title="Menu">
                        <IconButton onClick={toggleNavbar}>
                            <Menu />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            {value_d !== false ? (<Tooltip title="Add Task" placement="top"><button className="btn__changeMode" aria-label="Add Todo" onClick={addTodo} id="addTodo" style={{bottom: '17vh'}}>{value_d}</button></Tooltip>) : null}
		    <Tooltip title="Change Mode">
                <button className="btn__changeMode" aria-label="Change Mode" onClick={changeMode}>
                    <FontAwesomeIcon icon={faAdjust} size="2x"/>
                </button>
            </Tooltip>
            <div className="notifications" id="notifications">
                { releaseNotification !== "true" ?
                (
                    <div className="notification notification-warning" id="release-notification"><b>
                        Dear Users, starting from 2<sup>nd</sup> March 2021, Todo Application will implement Encryption Feature for Security Reason. As a result, all users which have registered before v0.3.2 will lost Todo's Data. We are sorry for the inconvenience.
                        <br/><br/><a onClick={closeWarning}>Got It</a>
                    </b></div>
                ) : '' }
            </div>

            <div id="changePasswordModal" className="modal">
                <div className="modal__container">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={closeModal}>&times;</span>
                        <h2>Change Password</h2>
                    </div>
                    <div className="modal__body">
                        <form onSubmit={submitNewPassword}>
                            <input type="text" className="contact__inputField" value={email} required autoComplete="username" readOnly style={{ display: 'none' }} />
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="old-password">Old Password <span className="required">*</span></label>
                                    <input title="Old Password" id="old-password" type={ visible ? 'text':'password' } className="contact__inputField" onChange={(event) => setOldPassword(event.target.value)} value={oldPassword} spellCheck="false" autoCapitalize="none" required autoComplete="current-password" />
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="form__container">
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="new-password">New Password <span className="required">*</span></label>
                                        <input title="New Password" id="new-password" type={ visible ? 'text':'password' } className="contact__inputField" onChange={(event) => setNewPassword(event.target.value)} value={newPassword} spellCheck="false" autoCapitalize="none" required autoComplete="new-password" />
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="confirm-password">Confirm New Password <span className="required">*</span></label>
                                        <input title="Confirm New Password" id="confirm-password" type={ visible ? 'text':'password' } className="contact__inputField" onChange={(event) => setConfirmPsw(event.target.value)} value={confirmPsw} spellCheck="false" autoCapitalize="none" required autoComplete="new-password" />
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                                <div className="contact__formControl show-password">
                                    <input id="show-password" onClick={() => setVisible(!visible)} type="checkbox" /> <label htmlFor="show-password">Show Pasword</label>
                                </div>
                            </div>
                            <button type="submit" id="btn-changePassword" className="btn__outline" style={{outline: 'none'}}>Change Password</button>
                        </form>
                    </div>
                </div>
            </div>

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