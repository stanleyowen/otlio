import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faInfo, faKey, faSignOutAlt, faEyeSlash, faEye, faCheckCircle, faTimesCircle, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { ConnectOAuthGitHub, ConnectOAuthGoogle, getCSRFToken, openModal, closeModal } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Account = ({ userData }) => {
    const {email, id, thirdParty, verified, authenticated, isLoading} = userData;
    const [data, setData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [properties, setProperties] = useState({
        disabled: false,
        password: false,
        newPassword: false,
        confirmPassword: false
    })

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    const handleData = (a, b) => setData({ ...data, [a]: b })

    useEffect(() => {
        const background = document.getElementById('background');
        const modal = document.getElementById('modal');
        window.onclick = function(e){
            if(e.target === background && !properties.disabled){
                modal.classList.remove('showModal');
                modal.classList.add('closeModal');
                background.classList.remove('showBackground');
                background.classList.add('hideBackground');
            }
        }
    }, [properties.disabled])

    const verifyAccount = (e) => {
        e.preventDefault();
        const text = document.getElementById('status');
        async function submitData() {
            text.innerHTML = "Veryfing Account..."; handleChange('disabled', true);
            await axios.post(`${SERVER_URL}/account/verify`, { email, id }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            text.innerHTML = "Verify Account"; handleChange('disabled', false);
        }
        if(!id || !email) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.");
        else submitData();
    }

    const changePassword = (e) => {
        e.preventDefault();
        const btn = document.getElementById('change-password');
        async function submitData() {
            btn.innerHTML = "Updating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); handleChange('disabled', true);
            await axios.put(`${SERVER_URL}/account/user`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                closeModal('background', 'modal');
                setData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message);
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Update"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false);
        }
        if(!data.oldPassword || !data.newPassword || !data.confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!data.oldPassword ? 'old-password' : !data.newPassword ? 'new-password' : 'confirm-password').focus(); }
        else if(data.oldPassword.length < 6 || data.newPassword.length < 6 || data.confirmPassword.length < 6 || data.oldPassword.length > 40 || data.newPassword.length > 40 || data.confirmPassword.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById(data.oldPassword.length < 6 || data.oldPassword.length > 40 ? 'old-password' : data.newPassword.length < 6 || data.newPassword.length > 40 ? 'new-password' : 'confirm-password').focus(); }
        else if(data.newPassword !== data.confirmPassword) { setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('confirm-password').focus(); }
        else submitData();
    }

    const closeInfo = (a) => {
        const infos = document.getElementById('infos')
        const info = document.getElementById(a);
        info.classList.add('closeModal');
        setTimeout(() => infos.removeChild(info), 200);
    }

    return (
        <div>
            { !authenticated ?
            (<div className="loader"><div className="spin-container full-width">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>) : null }

            <div id="form">
                <div id="infos">
                    <blockquote id="info-account-verification">
                        <span><FontAwesomeIcon icon={faInfo} style={{ fontSize: '1.5em' }} /></span>
                        <span className="info-title">Account Verification</span>
                        <button className="closeBtn" onClick={() => closeInfo('info-account-verification')}>&times;</button>
                        <p className="mt-10">Dear Users,<br />Starting from <b>1<sup>st</sup> May 2021</b>, Todo Application will Verify All Accounts by sending verification through Email in order to improve our services, security, and reliablity. We are sorry to inform that unverified accounts will no longer able to use our services.</p>
                    </blockquote>
                </div>

                <div className="form__contact">
                    <div className="get_in_touch"><h1>Account</h1></div>
                    <div className="form">
                        <div className="m-10 contact__infoField">
                            <label htmlFor="userEmail mt-20">Email Address</label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" value={email} disabled={true}/>
                            <Tooltip placement="top" title={ verified ? 'Verified Account' : 'Unverified Account' }>
                                <IconButton className="view-eye">
                                    <FontAwesomeIcon icon={ verified ? faCheckCircle : faTimesCircle } style={{ fontSize: '0.8em' }} className={ verified ? 'verified':'unverified' } />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="oauth-container">
                        <div className="m-10">
                            <button className="oauth-box verify-account" onClick={ properties.disabled || verified ? null : verifyAccount}>
                                <FontAwesomeIcon icon={faUserCheck} size='2x'/> <p id="status">{ verified ? 'Verified Account':'Verify Account' }</p>
                            </button>
                        </div>
                        <div className="m-10">
                            <button className="oauth-box change-password mt-20" onClick={() => openModal('background', 'modal', 'old-password')}>
                                <FontAwesomeIcon icon={faKey} size='2x'/> <p>Update Password</p>
                            </button>
                        </div>
                        <div className="m-10">
                            <button className="oauth-box logout mt-20" onClick={() => window.location='logout'}>
                                <FontAwesomeIcon icon={faSignOutAlt} size='2x'/> <p>Sign Out</p>
                            </button>
                        </div>
                    </div>
                    <div className="get_in_touch mt-40"><h2>Third Party</h2></div>
                    <div className="form__container">
                        <div className="m-10">
                            <button className="oauth-box google" onClick={isLoading ? null : thirdParty.isThirdParty ? thirdParty.google ? null : ConnectOAuthGoogle : ConnectOAuthGoogle}>
                                <FontAwesomeIcon icon={faGoogle} size='2x'/> {!isLoading && thirdParty && thirdParty.google ? <FontAwesomeIcon icon={faCheck} size='2x'/> : null } <p>{ thirdParty ? thirdParty.google ? 'Connected' : 'Connect' : 'Connect' } with Google</p>
                            </button>
                        </div>
                        <div className="m-10">
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
                            <form onSubmit={changePassword}>
                                <input type="text" className="contact__inputField" value={email} required autoComplete="username" readOnly style={{ display: 'none' }} />
                                <div className="m-10">
                                    <div className="contact__infoField">
                                        <label htmlFor="old-password">Old Password <span className="required">*</span></label>
                                        <input title="Old Password" id="old-password" type={ properties.password ? 'text':'password' } className="contact__inputField" onChange={(event) => handleData('oldPassword', event.target.value)} value={data.oldPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.password ? 'off':'current-password'} />
                                        <span className="contact__onFocus"></span>
                                        <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                            <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="form__container">
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="new-password">New Password <span className="required">*</span></label>
                                            <input title="New Password" id="new-password" type={ properties.newPassword ? 'text':'password' } className="contact__inputField" onChange={(event) => handleData('newPassword', event.target.value)} value={data.newPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.newPassword ? 'off':'new-password'} />
                                            <span className="contact__onFocus"></span>
                                            <IconButton className="view-eye" onClick={() => handleChange('newPassword', !properties.newPassword)} name="newPassword">
                                                <FontAwesomeIcon icon={properties.newPassword ? faEyeSlash : faEye} />
                                            </IconButton>
                                        </div>
                                    </div>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="confirm-password">Confirm New Password <span className="required">*</span></label>
                                            <input title="Confirm New Password" id="confirm-password" type={ properties.confirmPassword ? 'text':'password' } className="contact__inputField" onChange={(event) => handleData('confirmPassword', event.target.value)} value={data.confirmPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.confirmPassword ? 'off':'new-password'} />
                                            <span className="contact__onFocus"></span>
                                            <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', !properties.confirmPassword)} name="confirmPassword">
                                                <FontAwesomeIcon icon={properties.confirmPassword ? faEyeSlash : faEye} />
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>
                                <p className="isCentered"><a className="animation__underline" href="/reset-password">I forgot my password</a></p>
                                <div className="inline">
                                    <button type="submit" id="change-password" className="btn__outline" style={{outline: 'none'}}>Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;