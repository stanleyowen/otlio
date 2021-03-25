import React, { useState, useEffect } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import { ConnectOAuthGitHub, ConnectOAuthGoogle, getCSRFToken, openModal, closeModal } from '../libraries/validation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import { faKey } from '@fortawesome/free-solid-svg-icons';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Account = ({ userData }) => {
    const {email, id, thirdParty } = userData;
    const [oldPassword, setOldPassword] = useState();
    const [newPassword, setNewPassword] = useState();
    const [confirmPsw, setConfirmPsw] = useState();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const passwordModal = document.getElementById('changePasswordModal');
        window.onclick = function(e){
            if(e.target === passwordModal){
                passwordModal.classList.remove('showModal');
                passwordModal.classList.add('closeModal');
            }
        }
        console.log(userData)
    }, [userData])

    const submitNewPassword = (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-changePassword');
        async function submitData() {
            btn.innerHTML = "Changing Password";
            const postData = { id, oldPassword, newPassword, confirmPassword: confirmPsw }
            await axios.put(`${SERVER_URL}/account/user`, postData, { headers: { 'X-CSRF-TOKEN': getCSRFToken()[0], 'X-XSRF-TOKEN': getCSRFToken()[1] }, withCredentials: true })
            .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            closeModal('changePasswordModal');
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

    const notify = (e) => {
        e.preventDefault();
        setNotification(NOTIFICATION_TYPES.WARNING, 'Connecting Existing Account with GitHub OAuth Feature will be available soon in v0.4.2')
    }
    return (
        <div id="form">
            <div className="form__contact">
                <div className="get_in_touch"><h1>Account</h1></div>
                <div className="form">
                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="userEmail">Email</label>
                            <input title="Email" id="userEmail" type="email" className="contact__inputField" value={email} disabled={true}/>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                </div>
                <div className="oauth-container">
                    <button className="oauth-box change-password" onClick={() => openModal('changePasswordModal')}>
                        <FontAwesomeIcon icon={faKey} size='2x'/> <p> Change Your Password</p>
                    </button>
                    <button className="oauth-box google mt-20" onClick={thirdParty ? thirdParty.provider === "github" ? notify : null : ConnectOAuthGoogle}>
                        <FontAwesomeIcon icon={faGoogle} size='2x'/> <p> { thirdParty ? thirdParty.provider === "google" ? 'Connected' : 'Connect' : 'Connect' } with Google</p>
                    </button>
                    <button className="oauth-box github mt-20" onClick={thirdParty ? thirdParty.provider === "google" ? notify : null : ConnectOAuthGitHub}>
                        <FontAwesomeIcon icon={faGithub} size='2x'/> <p> { thirdParty ? thirdParty.provider === "github" ? 'Connected' : 'Connect' : 'Connect' } with GitHub</p>
                    </button>
                </div>
            </div>
            <div id="changePasswordModal" className="modal hiddenModal">
                <div className="modal__container">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={() => closeModal('changePasswordModal')}>&times;</span>
                        <h2>Change Password</h2>
                    </div>
                    <div className="modal__body">
                        <form onSubmit={submitNewPassword}>
                            <input type="text" className="contact__inputField" value={email} required autoComplete="username" readOnly style={{ display: 'none' }} />
                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="old-password">Old Password <span className="required">*</span></label>
                                    <input title="Old Password" id="old-password" type={ visible ? 'text':'password' } className="contact__inputField" onChange={(event) => setOldPassword(event.target.value)} value={oldPassword} spellCheck="false" autoCapitalize="none" required autoFocus autoComplete="none" />
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
        </div>
    );
}

export default Account;