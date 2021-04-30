import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle, faKeycdn } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faInfo, faKey, faSignOutAlt, faEyeSlash, faEye, faQuestionCircle, faExclamationTriangle, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FormControlLabel, IconButton, Tooltip, Switch } from '@material-ui/core';
import axios from 'axios';

import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { ConnectOAuthGitHub, ConnectOAuthGoogle, getCSRFToken, openModal, closeModal } from '../libraries/validation';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Account = ({ userData }) => {
    const {email, thirdParty, security, authenticated, isLoading} = userData;
    const {valid, invalid} = security ? security['backup-codes'] : [];

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
        const passwordBg = document.getElementById('password-bg');
        const passwordModal = document.getElementById('password-modal');
        const mfaBg = document.getElementById('mfa-bg');
        const mfaModal = document.getElementById('mfa-modal');
        const otpBg = document.getElementById('otp-bg');
        const otpModal = document.getElementById('otp-modal');
        const backupBg = document.getElementById('backup-code-bg');
        const backupModal = document.getElementById('backup-code-modal');
        window.onclick = (e) => {
            if(e.target === passwordBg && !properties.disabled){
                passwordModal.classList.remove('showModal');
                passwordModal.classList.add('closeModal');
                passwordBg.classList.remove('showBackground');
                passwordBg.classList.add('hideBackground');
            }else if(e.target === mfaBg && !properties.disabled){
                mfaModal.classList.remove('showModal');
                mfaModal.classList.add('closeModal');
                mfaBg.classList.remove('showBackground');
                mfaBg.classList.add('hideBackground');
            }else if(e.target === otpBg && !properties.disabled){
                otpModal.classList.remove('showModal');
                otpModal.classList.add('closeModal');
                otpBg.classList.remove('showBackground');
                otpBg.classList.add('hideBackground');
            }else if(e.target === backupBg && !properties.disabled){
                backupModal.classList.remove('showModal');
                backupModal.classList.add('closeModal');
                backupBg.classList.remove('showBackground');
                backupBg.classList.add('hideBackground');
            }
        }
    }, [properties.disabled])
    
    const backupCodes = () => {
        const codes = [...valid, ...invalid]
        // function validateToken(token) {
        //     for (let a=0; valid.length; a++){
        //         if(token === valid[a]) return true
        //         else if(a === valid.length-1 && token !== valid[a].toLowerCase()) return false
        //     }
        // }
        let table = document.createElement('table')
        let row = document.createElement('tr')
        let column = document.createElement('td')
        table.classList.add('isCentered', 'full-width', 'no-border')
        for (let x=0; x<codes.length; x++){
            if(x%2 === 0 && x !== 0){ table.innerHTML += row.outerHTML; column.innerHTML=codes[x]; row.innerHTML=column.outerHTML; }
            else if(x === codes.length - 1){ column.innerHTML = codes[x]; row.innerHTML += column.outerHTML; table.innerHTML += row.outerHTML; }
            else {column.innerHTML = codes[x]; row.innerHTML += column.outerHTML;}
        }
        return table.outerHTML;
    }

    const changePassword = (e) => {
        e.preventDefault();
        const btn = document.getElementById('change-password');
        const verifyBtn = document.getElementById('verify-otp');
        async function submitData() {
            verifyBtn.innerHTML = "Verifying..."; verifyBtn.setAttribute("disabled", "true"); verifyBtn.classList.add("disabled"); handleChange('disabled', true);
            btn.innerHTML = "Updating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.put(`${SERVER_URL}/account/user`, {...password, ...data}, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                closeModal('password-bg', 'password-modal'); closeModal('otp-bg', 'otp-modal');
                setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' }); setData({ tokenId: '', token: '' });
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message);
            })
            .catch(err =>{
                if(err.response.status === 428) openModal('otp-bg', 'otp-modal')
                document.getElementById('code-otp').focus()
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
            })
            verifyBtn.innerHTML = "Verify"; verifyBtn.removeAttribute("disabled"); verifyBtn.classList.remove("disabled");
            btn.innerHTML = "Update"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false);
        }
        if(!password.oldPassword || !password.newPassword || !password.confirmPassword){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!password.oldPassword ? 'old-password' : !password.newPassword ? 'new-password' : 'confirm-password').focus(); }
        else if(password.oldPassword.length < 6 || password.newPassword.length < 6 || password.confirmPassword.length < 6 || password.oldPassword.length > 60 || password.newPassword.length > 60 || password.confirmPassword.length > 60){ setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 60 characters !'); document.getElementById(password.oldPassword.length < 6 || password.oldPassword.length > 60 ? 'old-password' : password.newPassword.length < 6 || password.newPassword.length > 60 ? 'new-password' : 'confirm-password').focus(); }
        else if(password.newPassword !== password.confirmPassword) { setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('confirm-password').focus(); }
        else submitData();
    }

    const sendOTP = (e) => {
        e.preventDefault();
        const btn = document.getElementById('send-otp');
        const passwordBtn = document.getElementById('send-otp-pass');
        async function sendToken(){
            passwordBtn.innerHTML = "Sending..."; passwordBtn.setAttribute("disabled", "true"); passwordBtn.classList.add("disabled"); handleChange('disabled', true);
            btn.innerHTML = "Sending..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled");
            await axios.get(`${SERVER_URL}/account/otp`, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                handleData('tokenId', res.data.credentials.tokenId)
                document.getElementById('code').focus()
                document.getElementById('code-otp').focus()
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            passwordBtn.innerHTML = "Send Verification Code"; passwordBtn.removeAttribute("disabled"); passwordBtn.classList.remove("disabled");
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
            await axios.put(`${SERVER_URL}/account/otp`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                localStorage.setItem('info', JSON.stringify(res.data))
                closeModal('mfa-bg', 'mfa-modal')
                window.location.reload()
            })
            .catch(err => {
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
                document.getElementById('code').focus()
            })
            if (security['2FA']) btn.innerHTML = "Deactivate";
            else btn.innerHTML = "Activate";
            btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false);
        }
        if(properties.honeypot) return;
        else if(!data.tokenId) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.");
        else if(!data.token){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById('code').focus(); }
        else submitData();
    }

    const RegenerateToken = (e) => {
        e.preventDefault();
        const btn = document.getElementById('generate-token');
        async function generateToken(){
            btn.innerHTML = "Generating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); handleChange('disabled', true);
            await axios.post(`${SERVER_URL}/account/backup-code`, { "regenerate": true }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                userData.security['backup-codes'].valid = res.data['backup-codes']
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerHTML = "Regenerate Code"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false);
        }
        if(!security['2FA']) setNotification(NOTIFICATION_TYPES.WARNING, 'Backup Codes are only eligle in Multi Factor Authentication (MFA) Users')
        else generateToken();
    }

    return (
        <div>
            { !authenticated ?
            (<div className="loader"><div className="spin-container">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>) : null }

            <div id="form">
                <div className="form__contact">
                    <div className="get_in_touch"><h1>Account</h1></div>
                    <div className="form">
                        <div className="m-10 contact__infoField">
                            <label htmlFor="userEmail">Email Address</label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" value={email} disabled={true}/>
                        </div>
                    </div>
                    <div className="oauth-container">
                        <div className="m-10">
                            <button className="oauth-box primary mt-20" onClick={() => openModal('password-bg', 'password-modal', 'old-password')}>
                                <FontAwesomeIcon icon={faKeycdn} size='2x'/> <p>Update Password</p>
                            </button>
                        </div>
                        <div className="m-10">
                            <button className="oauth-box primary mt-20" onClick={() => window.location='logout'}>
                                <FontAwesomeIcon icon={faSignOutAlt} size='2x'/> <p>Sign Out</p>
                            </button>
                        </div>
                    </div>
                    <div className="get_in_touch mt-40"><h1>Security</h1></div>
                    <div className="form">
                        <div className="m-10">
                            <FormControlLabel control={
                                <Switch checked={!isLoading ? security['2FA'] : false} onClick={() => !isLoading ? openModal('mfa-bg', 'mfa-modal') : null} color={document.body.classList.contains("dark") ? "white" : "primary"}/>
                            } label="Multi Factor Authentication (MFA)" />
                            <Tooltip placement="top" className="ml-10" title="Two-Factor Authentication (2FA) is a good way to add an extra layer of security to your account to make sure that only you have the ability to log in." arrow><span><FontAwesomeIcon icon={faQuestionCircle} size="sm" /></span></Tooltip> 
                        </div>
                    </div>
                    <div className="oauth-container">
                        <div className="m-10">
                            <button className="oauth-box primary mt-20" onClick={() => authenticated && security['2FA'] ? openModal('backup-code-bg', 'backup-code-modal') : setNotification(NOTIFICATION_TYPES.WARNING, 'Backup Codes are only eligle in Multi Factor Authentication (MFA) Users')}>
                                <FontAwesomeIcon icon={faKey} size='2x'/> <p>Backup Codes</p>
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
                    <p className="isCentered mt-20 mb-20"><a href="/terms-and-conditions">Terms of Service</a> | <a href="/privacy-policy">Privacy Policy</a></p>
                    <p className="isCentered mt-20 mb-20">Copyright &copy; 2021 Todo Application - All Rights Reserved.</p>
                </div>
            </div>

            <div id="password-bg" className="modal hiddenModal">
                <div id="password-modal" className="modal__container hiddenModal">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={() => closeModal('password-bg', 'password-modal')}>&times;</span>
                        <h2>Update Password</h2>
                    </div>
                    <div className="modal__body">
                        <form onSubmit={changePassword}>
                            <input type="text" className="contact__inputField" value={email} required autoComplete="username" readOnly style={{ display: 'none' }} />
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="old-password">Old Password <span className="required">*</span></label>
                                    <input title="Old Password" id="old-password" type={ properties.password ? 'text':'password' } className="contact__inputField" maxLength="60" onChange={(event) => handlePassword('oldPassword', event.target.value)} value={password.oldPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.password ? 'off':'current-password'} />
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
                                        <input title="New Password" id="new-password" type={ properties.newPassword ? 'text':'password' } className="contact__inputField" maxLength="60" onChange={(event) => handlePassword('newPassword', event.target.value)} value={password.newPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.newPassword ? 'off':'new-password'} />
                                        <span className="contact__onFocus"></span>
                                        <IconButton className="view-eye" onClick={() => handleChange('newPassword', !properties.newPassword)} name="newPassword">
                                            <FontAwesomeIcon icon={properties.newPassword ? faEyeSlash : faEye} />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="m-10">
                                    <div className="contact__infoField">
                                        <label htmlFor="confirm-password">Confirm New Password <span className="required">*</span></label>
                                        <input title="Confirm New Password" id="confirm-password" type={ properties.confirmPassword ? 'text':'password' } className="contact__inputField" maxLength="60" onChange={(event) => handlePassword('confirmPassword', event.target.value)} value={password.confirmPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.confirmPassword ? 'off':'new-password'} />
                                        <span className="contact__onFocus"></span>
                                        <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', !properties.confirmPassword)} name="confirmPassword">
                                            <FontAwesomeIcon icon={properties.confirmPassword ? faEyeSlash : faEye} />
                                        </IconButton>
                                    </div>
                                </div>
                            </div>
                            <p className="isCentered"><a className="animation__underline" href="/reset-password">I forgot my password</a></p>
                            <button type="submit" id="change-password" className="btn__outline no-outline">Update</button>
                        </form>
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
                                <blockquote className="mt-20">
                                    <span><FontAwesomeIcon icon={faInfo} style={{ fontSize: '1.5em' }} /></span>
                                    <span className="info-title">Verification Code</span>
                                    <p className="mt-10">Verification Code will be sent to <b>{email}</b> via email and will be valid for only <b>5 (five) minutes</b>.</p>
                                    <p className="mt-10"><b>Note: Once you enable 2 Factor Authentication (2FA), you will be prompted to enter verification code on every login session.</b></p>
                                </blockquote>
                                <button id="send-otp" className="btn__outline no-outline" onClick={sendOTP}>Send Verification Code</button>
                            </li>
                            <li>
                                Verify Code
                                <blockquote className="mt-20">
                                    <span><FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '1.5em' }} /></span>
                                    <span className="info-title">Account Recovery</span>
                                    <p className="mt-10"><b>Note: If you do not have access to both your account or email, we are unable to remove 2FA and you will have to create a new account.</b></p>
                                </blockquote>
                                <form onSubmit={VerifyOTP}>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="code">Verification Code</label>
                                            <input title="Old Password" id="code" type="text" className="contact__inputField" onChange={(event) => handleData('token', event.target.value)} value={data.token} spellCheck="false" autoCapitalize="none" required maxLength="6" placeholder="6-Digit Verification Code" autoComplete="one-time-code" />
                                            <span className="contact__onFocus"></span>
                                        </div>
                                    </div>
                                    <button type="submit" id="verify" className="btn__outline no-outline">{ !isLoading ? security['2FA'] ? 'Deactivate' : 'Activate' : 'Activate' }</button>
                                </form>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            <div id="otp-bg" className="modal hiddenModal">
                <div id="otp-modal" className="modal__container hiddenModal">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={() => closeModal('otp-bg', 'otp-modal')}>&times;</span>
                        <h2>Authentication Required</h2>
                    </div>
                    <div className="modal__body mt-10">
                        <ol className="ml-40 ul-mb10">
                            <li>
                                Send Verification Code
                                <blockquote className="mt-20">
                                    <span><FontAwesomeIcon icon={faInfo} style={{ fontSize: '1.5em' }} /></span>
                                    <span className="info-title">Change Password</span>
                                    <p className="mt-10">In order to improve our services, qualities, and securities, we will need an <b>OTP Token</b> before users perform Change Password Request.</p>
                                </blockquote>
                                <button id="send-otp-pass" className="btn__outline no-outline" onClick={sendOTP}>Send Verification Code</button>
                            </li>
                            <li>
                                Verify Code
                                <form onSubmit={changePassword}>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="code">Verification Code</label>
                                            <input title="Old Password" id="code-otp" type="text" className="contact__inputField" onChange={(event) => handleData('token', event.target.value)} value={data.token} spellCheck="false" autoCapitalize="none" required maxLength="6" placeholder="6-Digit Verification Code" autoComplete="one-time-code" />
                                            <span className="contact__onFocus"></span>
                                        </div>
                                    </div>
                                    <button type="submit" id="verify-otp" className="btn__outline no-outline">Verify</button>
                                </form>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            <div id="backup-code-bg" className="modal hiddenModal">
                <div id="backup-code-modal" className="modal__container hiddenModal">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={() => closeModal('backup-code-bg', 'backup-code-modal')}>&times;</span>
                        <h2>Backup Codes</h2>
                    </div>
                    <div className="modal__body mt-10">
                        { authenticated && security['2FA'] ? <div dangerouslySetInnerHTML={{__html: backupCodes()}}></div> : null }
                        <button id="generate-token" className="btn__outline no-outline" onClick={RegenerateToken}>Regenerate Code</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;