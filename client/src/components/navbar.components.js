/* eslint-disable */
import React, { useEffect, useState } from 'react';
import getUserToken from '../library/getUserToken';
import { useLocation } from 'react-router-dom';
import { setNotification, NOTIFICATION_TYPES, setWarning } from '../library/setNotification';
import axios from 'axios';

const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const redirectRoute = ['welcome', 'login', 'get-started'];
const privateRoute = ['', 'edit'];

const Navbar = () => {
    const location = useLocation();
    const email = localStorage.getItem('__email');
    const [value_a, setValue_a] = useState([]);
    const [value_b, setValue_b] = useState([]);
    const [value_c, setValue_c] = useState();
    const [value_d, setValue_d] = useState(false);
    const [value_e, setValue_e] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPsw, setConfirmPsw] = useState('');
    
    useEffect(() => {
        async function getToken() {
            const token = localStorage.getItem('__token');
            const userId = localStorage.getItem('__id');
            const theme = localStorage.getItem('__theme');
            if(theme == "dark"){
                document.body.classList.add("dark");
            }
            if(token && userId){
                getUserToken(token, userId)
                .then(res => {
                    if(res){
                        localStorage.setItem('__email', res.email);
                        setValue_a(['Dashboard',`${CLIENT_URL}`]);
                        setValue_b(['Logout','#!',Logout]);
                        setValue_c('/')
                        setValue_d(<i className="fas fa-plus" style={{fontSize: "2.2em"}}></i>)
                        setValue_e(true)
                        redirectRoute.forEach(a => {
                            if(location.pathname.split('/')[1] === a) window.location='/';
                        });
                    }else {
                        setValue_a(['Login',`${CLIENT_URL}/login`]);
                        setValue_b(['Get Started',`${CLIENT_URL}/get-started`]);
                        setValue_c('/welcome');
                        localStorage.removeItem('__id');
                        localStorage.removeItem('__token');
                        localStorage.removeItem('__email');
                        privateRoute.forEach(a => {
                            if(location.pathname.split('/')[1] === a) window.location='/welcome';
                        });
                    }
                })
            }else {
                setValue_a(['Login',`${CLIENT_URL}/login`]);
                setValue_b(['Get Started',`${CLIENT_URL}/get-started`]);
                setValue_c('/welcome');
                privateRoute.forEach(a => {
                    if(location.pathname.split('/')[1] === a) window.location='/welcome';
                });
            }
        }
        getToken();
        setWarning();
    },[]);

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
                <a className="navbar__logo" href={value_c}>TodoApp</a>
                <div className="navbar__menu" id="navbar__menu">
                    <a className="animation__underline" href={value_a[1]}>{value_a[0]}</a>
                    {value_e !== false ? (<a className="animation__underline" onClick={changePasswordModal}>Change Password</a>) : null}
                    <a className="animation__underline" id={value_b[0]} href={value_b[1]} onClick={value_b[2]}>{value_b[0]}</a>
                </div>
                <a href="#!" className="toggleNavbar" onClick={toggleNavbar}><i className="fa fa-bars"></i></a>
            </div>
            {value_d !== false ? (<button className="btn__changeMode" aria-label="Add Todo" onClick={addTodo} id="addTodo" style={{bottom: '17vh'}}>{value_d}</button>) : null}
		    <button className="btn__changeMode" aria-label="Change Mode" onClick={changeMode}><i className="fas fa-adjust" style={{fontSize: '2em'}}></i></button>
            <div className="notifications" id="notifications"></div>

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
                                    <input title="Old Password" id="old-password" type="password" className="contact__inputField" onChange={(event) => setOldPassword(event.target.value)} value={oldPassword} required autoComplete="current-password" />
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="new-password">New Password <span className="required">*</span></label>
                                    <input title="New Password" id="new-password" type="password" className="contact__inputField" onChange={(event) => setNewPassword(event.target.value)} value={newPassword} required autoComplete="new-password" />
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="confirm-password">Confirm New Password <span className="required">*</span></label>
                                    <input title="Confirm New Password" id="confirm-password" type="password" className="contact__inputField" onChange={(event) => setConfirmPsw(event.target.value)} value={confirmPsw} required autoComplete="new-password" />
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <button type="submit" id="btn-changePassword" className="btn__outline" style={{outline: 'none'}}>Change Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;