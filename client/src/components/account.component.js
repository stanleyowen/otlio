import React, { useState, useEffect } from 'react';
import { FormControlLabel, IconButton, Tooltip, Switch } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faInfo, faKey, faSignOutAlt, faEyeSlash, faEye, faCheckCircle, faTimesCircle, faUserCheck, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { ConnectOAuthGitHub, ConnectOAuthGoogle, getCSRFToken, openModal, closeModal } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Account = ({ userData }) => {
    const {email, id, thirdParty, verified, security, authenticated, isLoading} = userData;
    const [password, setPassword] = useState({
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
    const [data, setData] = useState({
        tokenId: '',
        token: ''
    })

    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    const handlePassword = (a, b) => setPassword({ ...password, [a]: b })
    const handleData = (a, b) => setData({ ...data, [a]: b })

    useEffect(() => {
        const background = document.getElementById('background');
        const modal = document.getElementById('modal');
        const mfaBg = document.getElementById('mfa-bg');
        const mfaModal = document.getElementById('mfa-modal');
        window.onclick = function(e){
            if(e.target === background && !properties.disabled){
                modal.classList.remove('showModal');
                modal.classList.add('closeModal');
                background.classList.remove('showBackground');
                background.classList.add('hideBackground');
            }if(e.target === mfaBg && !properties.disabled){
                mfaModal.classList.remove('showModal');
                mfaModal.classList.add('closeModal');
                mfaBg.classList.remove('showBackground');
                mfaBg.classList.add('hideBackground');
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
            await axios.put(`${SERVER_URL}/account/user`, password, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                closeModal('background', 'modal');
                setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' })
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message);
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.innerHTML = "Update"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false);
        }
        if(!password.oldPassword || !password.newPassword || !password.confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!password.oldPassword ? 'old-password' : !password.newPassword ? 'new-password' : 'confirm-password').focus(); }
        else if(password.oldPassword.length < 6 || password.newPassword.length < 6 || password.confirmPassword.length < 6 || password.oldPassword.length > 40 || password.newPassword.length > 40 || password.confirmPassword.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 40 characters !'); document.getElementById(password.oldPassword.length < 6 || password.oldPassword.length > 40 ? 'old-password' : password.newPassword.length < 6 || password.newPassword.length > 40 ? 'new-password' : 'confirm-password').focus(); }
        else if(password.newPassword !== password.confirmPassword) { setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('confirm-password').focus(); }
        else submitData();
    }

    const sendOTP = (e) => {
        e.preventDefault();
        const btn = document.getElementById('send-otp');
        async function sendToken(){
            btn.innerHTML = "Sending..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); handleChange('disabled', true);
            await axios.get(`${SERVER_URL}/account/otp`, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                handleData('tokenId', res.data.credentials.tokenId)
                document.getElementById('code').focus()
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerHTML = "Send Verification Code"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false);
        }
        if(!authenticated) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.");
        else sendToken()
    }

    const VerifyOTP = (e) => {
        e.preventDefault();
        const btn = document.getElementById('verify');
        async function submitData(){
            if (security['2FA']) btn.innerHTML = "Deactivating...";
            else btn.innerHTML = "Activating...";
            btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); handleChange('disabled', true);
            await axios.put(`${SERVER_URL}/account/otp`, { tokenId: data.tokenId, token: data.token }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                localStorage.setItem('info', JSON.stringify(res.data))
                closeModal('mfa-bg', 'mfa-modal');
                window.location.reload();
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            if (security['2FA']) btn.innerHTML = "Deactivate";
            else btn.innerHTML = "Activate";
            btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false);
        }
        if(properties.honeypot) return;
        else if(!data.tokenId) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.");
        else if(!data.token){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById('code').focus(); }
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
                            <label htmlFor="userEmail">Email Address</label>
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
                    <div className="get_in_touch mt-40"><h1>Security <sup className="required small">Beta</sup></h1></div>
                    <div className="form">
                        <div className="m-10">
                            <FormControlLabel control={
                                <Switch checked={!isLoading ? security['2FA'] : false} onClick={() => !isLoading ? security['2FA'] ? openModal('mfa-bg', 'mfa-modal') : openModal('warning-beta-bg', 'warning-beta') : null} color="primary"/>
                            } label="Multi Factor Authentication (MFA)" />
                            
                            <Tooltip placement="top" className="ml-10" title="Warning: Please note that this is a beta version of the Multi Factor Authentication (MFA) which is still undergoing final testing before its official release. The Todo Application does not give any warranties, whether express or implied, as to the suitability or usability of users' account." arrow><span><FontAwesomeIcon icon={faQuestionCircle} size="sm" /></span></Tooltip> 
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
                                        <input title="Old Password" id="old-password" type={ properties.password ? 'text':'password' } className="contact__inputField" onChange={(event) => handlePassword('oldPassword', event.target.value)} value={password.oldPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.password ? 'off':'current-password'} />
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
                                            <input title="New Password" id="new-password" type={ properties.newPassword ? 'text':'password' } className="contact__inputField" onChange={(event) => handlePassword('newPassword', event.target.value)} value={password.newPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.newPassword ? 'off':'new-password'} />
                                            <span className="contact__onFocus"></span>
                                            <IconButton className="view-eye" onClick={() => handleChange('newPassword', !properties.newPassword)} name="newPassword">
                                                <FontAwesomeIcon icon={properties.newPassword ? faEyeSlash : faEye} />
                                            </IconButton>
                                        </div>
                                    </div>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="confirm-password">Confirm New Password <span className="required">*</span></label>
                                            <input title="Confirm New Password" id="confirm-password" type={ properties.confirmPassword ? 'text':'password' } className="contact__inputField" onChange={(event) => handlePassword('confirmPassword', event.target.value)} value={password.confirmPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.confirmPassword ? 'off':'new-password'} />
                                            <span className="contact__onFocus"></span>
                                            <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', !properties.confirmPassword)} name="confirmPassword">
                                                <FontAwesomeIcon icon={properties.confirmPassword ? faEyeSlash : faEye} />
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>
                                <p className="isCentered"><a className="animation__underline" href="/reset-password">I forgot my password</a></p>
                                <div className="inline">
                                    <button type="submit" id="change-password" className="btn__outline">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div id="warning-beta-bg" className="modal hiddenModal">
                    <div id="warning-beta" className="modal__container hiddenModal">
                        <div className="modal__title">
                            <h2 className="required">Warning</h2>
                        </div>
                        <div className="modal__body">
                            Please note that this is a <span className="required">beta</span> version of the <b>Multi Factor Authentication (MFA)</b> which is still undergoing final testing before its official release. The Todo Application does not give any warranties, whether express or implied, as to the suitability or usability of users' account.
                            <div className="flex">
                                <button id="cancel" className="btn__outline solid" onClick={() => closeModal('warning-beta-bg', 'warning-beta')}>Cancel</button>
                                <button id="change-password" className="btn__outline" onClick={() => { closeModal('warning-beta-bg', 'warning-beta'); openModal('mfa-bg', 'mfa-modal') }}>I Agree and Understand</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="mfa-bg" className="modal hiddenModal">
                    <div id="mfa-modal" className="modal__container hiddenModal">
                        <div className="modal__title">
                            <span className="modal__closeFireUI modal__closeBtn" onClick={() => closeModal('mfa-bg', 'mfa-modal')}>&times;</span>
                            <h2>Multi Factor Authentication (MFA)</h2>
                        </div>
                        <div className="modal__body mt-10">
                            <ol className="ml-40 ul-mb10">
                                <li>
                                    Send Verification Code
                                    <button id="send-otp" className="btn__outline" onClick={sendOTP}>Send Verification Code</button>
                                </li>
                                <li>
                                    Verify Code
                                    <form onSubmit={VerifyOTP}>
                                        <div className="m-10">
                                            <div className="contact__infoField">
                                                <label htmlFor="code">Verification Code</label>
                                                <input title="Old Password" id="code" type="text" className="contact__inputField" onChange={(event) => handleData('token', event.target.value)} value={data.token} spellCheck="false" autoCapitalize="none" required autoComplete="one-time-code" />
                                                <span className="contact__onFocus"></span>
                                            </div>
                                        </div>
                                        <div className="inline">
                                            <button type="submit" id="verify" className="btn__outline">{ !isLoading ? security['2FA'] ? 'Deactivate' : 'Activate' : 'Activate' }</button>
                                        </div>
                                    </form>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;