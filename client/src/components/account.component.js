import React, { useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faInfo, faKey, faSignOutAlt, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { ConnectOAuthGitHub, ConnectOAuthGoogle, getCSRFToken, openModal, closeModal, Logout } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Account = ({ userData }) => {
    const {email, id, thirdParty, isLoading} = userData;
    const [oldPassword, setOldPassword] = useState();
    const [newPassword, setNewPassword] = useState();
    const [confirmPsw, setConfirmPsw] = useState();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [cfPasswordVisible, setCfPasswordVisible] = useState(false);

    useEffect(() => {
        const background = document.getElementById('background');
        const modal = document.getElementById('modal');
        window.onclick = function(e){
            if(e.target === modal || e.target === background){
                modal.classList.remove('showModal');
                modal.classList.add('closeModal');
                background.classList.remove('showBackground');
                background.classList.add('hideBackground');
            }
        }
    }, [userData])

    const submitNewPassword = (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-changePassword');
        async function submitData() {
            btn.innerHTML = "Updating...";
            const data = { id, email, oldPassword, newPassword, confirmPassword: confirmPsw }
            await axios.put(`${SERVER_URL}/account/user`, data, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            closeModal('background', 'modal');
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Update";
            setOldPassword(''); setNewPassword(''); setConfirmPsw('');
        }
        if(!email) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else if(!oldPassword || !newPassword || !confirmPsw){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!oldPassword ? 'old-password' : !newPassword ? 'new-password' : 'confirm-password').focus(); }
        else if(oldPassword.length < 6 || newPassword.length < 6 || confirmPsw.length < 6 || oldPassword.length > 40 || newPassword.length > 40 || confirmPsw.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById(oldPassword.length < 6 || oldPassword.length > 40 ? 'old-password' : newPassword.length < 6 || newPassword.length > 40 ? 'new-password' : 'confirm-password').focus(); }
        else if(newPassword !== confirmPsw) { setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('confirm-password').focus(); }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }

    const closeInfo = (a) => {
        const infos = document.getElementById('infos')
        const info = document.getElementById(a);
        info.classList.add('closeModal');
        setTimeout(() => { infos.removeChild(info) }, 200);
    }
    return (
        <div>
            { !email ?
            (<div className="loader"><div className="spin-container full-width">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>) : null }
            <div id="form">
                <div id="infos">
                    <blockquote id="info-oauth">
                        <span><FontAwesomeIcon icon={faInfo} style={{ fontSize: '1.5em' }} /></span>
                        <span className="info-title">Multiple OAuth Account</span>
                        <button className="closeBtn" onClick={() => closeInfo('info-oauth')}>&times;</button>
                        <p className="mt-10">Connecting an account with Multiple Third Parties Feature will be available in the Future Release.</p>
                    </blockquote>
                    <blockquote id="info-oauth">
                        <span><FontAwesomeIcon icon={faInfo} style={{ fontSize: '1.5em' }} /></span>
                        <span className="info-title">Account Verification</span>
                        <button className="closeBtn" onClick={() => closeInfo('info-oauth')}>&times;</button>
                        <p className="mt-10">Dear Users, starting from 1st May 2021, Todo Application will Verify All Accounts by sending verification through email. We are sorry to inform that unverified accounts will no longer able to use our services. More information about policy will be posted on the next release.</p>
                    </blockquote>
                </div>
                <div className="form__contact">
                    <div className="get_in_touch"><h1>Account</h1></div>
                    <div className="form">
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="userEmail">Email Address</label>
                                <input title="Email" id="userEmail" type="email" className="contact__inputField" value={email} disabled={true}/>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                    </div>
                    <div className="oauth-container">
                        <div className="contact__formControl">
                            <button className="oauth-box change-password" onClick={() => {openModal('background', 'modal', 'old-password')}}>
                                <FontAwesomeIcon icon={faKey} size='2x'/> <p>Update Password</p>
                            </button>
                        </div>
                        <div className="contact__formControl">
                            <button className="oauth-box logout mt-20" onClick={() => Logout(id, email)}>
                                <FontAwesomeIcon icon={faSignOutAlt} size='2x'/> <p>Sign Out</p>
                            </button>
                        </div>
                    </div>
                    <div className="get_in_touch mt-40"><h2>Third Party</h2></div>
                    <div className="form__container">
                        <div className="contact__formControl">
                            <button className="oauth-box google" onClick={isLoading ? null : thirdParty.isThirdParty ? thirdParty.google ? null : ConnectOAuthGoogle : ConnectOAuthGoogle}>
                                <FontAwesomeIcon icon={faGoogle} size='2x'/> {!isLoading && thirdParty && thirdParty.google ? <FontAwesomeIcon icon={faCheck} size='2x'/> : null } <p>{ thirdParty ? thirdParty.google ? 'Connected' : 'Connect' : 'Connect' } with Google</p>
                            </button>
                        </div>
                        <div className="contact__formControl">
                            <button className="oauth-box github" onClick={isLoading ? null : thirdParty.isThirdParty ? thirdParty.github ? null : ConnectOAuthGitHub : ConnectOAuthGitHub}>
                                <FontAwesomeIcon icon={faGithub} size='2x'/> {!isLoading && thirdParty && thirdParty.github ? <FontAwesomeIcon icon={faCheck} size='2x'/> : null } <p>{ thirdParty ? thirdParty.github ? 'Connected' : 'Connect' : 'Connect' } with GitHub</p>
                            </button>
                        </div>
                    </div>
                    <hr className="mt-20"></hr>
                    <p className="isCentered mt-20 mb-20">Copyright &copy; 2021 Todo Application - All Rights Reserved.</p>
                </div>
                <div id="background" className="modal hiddenModal">
                    <div id="modal" className="modal__container hiddenModal">
                        <div className="modal__title">
                            <span className="modal__closeFireUI modal__closeBtn" onClick={() => closeModal('background', 'modal')}>&times;</span>
                            <h2>Update Password</h2>
                        </div>
                        <div className="modal__body">
                            <form onSubmit={submitNewPassword}>
                                <input type="text" className="contact__inputField" value={email} required autoComplete="username" readOnly style={{ display: 'none' }} />
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="old-password">Old Password <span className="required">*</span></label>
                                        <input title="Old Password" id="old-password" type={ passwordVisible ? 'text':'password' } className="contact__inputField" onChange={(event) => setOldPassword(event.target.value)} value={oldPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ passwordVisible ? 'off':'current-password'} />
                                        <span className="contact__onFocus"></span>
                                        <IconButton className="view-eye" onClick={() => setPasswordVisible(!passwordVisible)}>
                                            <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="form__container">
                                    <div className="contact__formControl">
                                        <div className="contact__infoField">
                                            <label htmlFor="new-password">New Password <span className="required">*</span></label>
                                            <input title="New Password" id="new-password" type={ newPasswordVisible ? 'text':'password' } className="contact__inputField" onChange={(event) => setNewPassword(event.target.value)} value={newPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ newPasswordVisible ? 'off':'new-password'} />
                                            <span className="contact__onFocus"></span>
                                            <IconButton className="view-eye" onClick={() => setNewPasswordVisible(!newPasswordVisible)}>
                                                <FontAwesomeIcon icon={newPasswordVisible ? faEyeSlash : faEye} />
                                            </IconButton>
                                        </div>
                                    </div>
                                    <div className="contact__formControl">
                                        <div className="contact__infoField">
                                            <label htmlFor="confirm-password">Confirm New Password <span className="required">*</span></label>
                                            <input title="Confirm New Password" id="confirm-password" type={ cfPasswordVisible ? 'text':'password' } className="contact__inputField" onChange={(event) => setConfirmPsw(event.target.value)} value={confirmPsw} spellCheck="false" autoCapitalize="none" required autoComplete={ cfPasswordVisible ? 'off':'new-password'} />
                                            <span className="contact__onFocus"></span>
                                            <IconButton className="view-eye" onClick={() => setCfPasswordVisible(!cfPasswordVisible)}>
                                                <FontAwesomeIcon icon={cfPasswordVisible ? faEyeSlash : faEye} />
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>
                                <p className="isCentered"><a className="animation__underline" href="/reset-password">I forgot my password</a></p>
                                <button type="submit" id="btn-changePassword" className="btn__outline" style={{outline: 'none'}}>Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;