import axios from 'axios'
import dompurify from 'dompurify'
import React, { useState, useEffect } from 'react'
import { Skeleton } from '@material-ui/lab'
import { FormControlLabel, IconButton, Switch } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faGoogle, faKeycdn } from '@fortawesome/free-brands-svg-icons'
import { faCheck, faInfo, faKey, faTimes, faSignOutAlt, faEyeSlash, faEye, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

import Images from '../libraries/image'
import { getCSRFToken, openModal, closeModal } from '../libraries/validation'
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification'

const isNum = /^\d+$/

const Account = ({ userData }) => {
    const {email, thirdParty, security, authenticated, isLoading, server: SERVER_URL} = userData
    const {valid, invalid} = authenticated ? security['backup-codes'] : []
    const sanitizer = dompurify.sanitize

    const [password, setPassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [properties, setProperties] = useState({
        disabled: false,
        password: false,
        newPassword: false,
        confirmPassword: false,
        mfa: false
    })
    const [data, setData] = useState({
        tokenId: '',
        token: '',
        isBackupCode: false
    })

    const handleData = (a, b) => setData({ ...data, [a]: b })
    const handlePassword = (a, b) => setPassword({ ...password, [a]: b })
    const handleChange = (a, b) => setProperties({ ...properties, [a]: b })
    
    useEffect(() => {
        window.onclick = e =>
            ['password', 'mfa', 'otp', 'backup-code'].forEach(a => {
                const modal = document.getElementById(`${a}-modal`)
                const background = document.getElementById(`${a}-bg`)
                if(e.target === background && !properties.disabled) {
                    modal.classList.remove('showModal')
                    modal.classList.add('closeModal')
                    background.classList.remove('showBackground')
                    background.classList.add('hideBackground')
                }
            })
        for (let x=1; x<3; x++) {
            const otp = document.querySelectorAll(`#otp${x} > *[id]`)
            for (let i=0; i<otp.length; i++) {
                Object.assign(otp[i], {
                    type: 'text', maxLength: 1,
                    pattern: '[0-9]', autocomplete: 'off',
                    inputMode: 'numeric', required: true
                })
                otp[i].addEventListener('keydown', e => {
                    if(e.key === "Backspace") {
                        if(i !== 0) otp[i-1].focus()
                        otp[i].value = ''
                    }else if((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 95 && e.keyCode < 106)) {
                        if (i !== otp.length-1) otp[i+1].focus()
                        otp[i].value = e.key
                        e.preventDefault()
                    }
                })
            }
        }
    }, [properties.disabled, data])

    const BackupCodes = () => {
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
        table.classList.add('full-width', 'no-border')
        for (let x=0; x<codes.length; x++) {
            if(x%2 === 0 && x !== 0) {table.innerHTML += row.outerHTML; column.innerHTML = codes[x]; row.innerHTML = column.outerHTML}
            else if(x === codes.length - 1) {column.innerHTML = codes[x]; row.innerHTML += column.outerHTML; table.innerHTML += row.outerHTML}
            else {column.innerHTML = codes[x]; row.innerHTML += column.outerHTML}
        } return table.outerHTML
    }

    const BackupCode = () => {
        const codes = [...valid, ...invalid]
        return `SAVE YOUR BACKUP CODES\n\nKeep these backup codes somewhere safe but accessible.\nEach backup code can only be used once.\n
1. ${codes[0]}		 6. ${codes[5]}
2. ${codes[1]}		 7. ${codes[6]}
3. ${codes[2]}		 8. ${codes[7]}
4. ${codes[3]}		 9. ${codes[8]}
5. ${codes[4]}		10. ${codes[9]}\n
(stanleyowen06@gmail.com)`
    }

    const CopyCode = (e) => {
        e.preventDefault()
        const btn = document.getElementById('copy-code')
        const code = document.getElementById('backup-codes')
        code.select(); code.setSelectionRange(0, 99999); document.execCommand("copy")
        btn.innerText = "Copied to Clipboard"
        setTimeout(() => btn.innerText = "Copy to Clipboard", 3000)
    }

    const DownloadCode = (e) => {
        e.preventDefault()
        const btn = document.getElementById('download-code')
        const tempLink = document.createElement('a')
        const blob = new Blob ([BackupCode()], { type: 'application/octet-stream' })
        tempLink.classList.add('none')
        tempLink.download = 'Backup Codes.txt'
        tempLink.href = URL.createObjectURL(blob)
        tempLink.dataset.downloadurl = ['application/octet-stream', tempLink.download, tempLink.href].join(':')
        document.body.appendChild(tempLink)
        tempLink.click()
        btn.innerText = "Downloaded"
        setTimeout(() => {
            document.body.removeChild(tempLink)
            window.URL.revokeObjectURL(tempLink)
        }, 500)
        setTimeout(() => btn.innerText = "Download", 3000)
    }

    const changePassword = (e) => {
        e.preventDefault()
        let token = ''
        const otp = document.querySelectorAll('#otp2 > *[id]')
        const btn = document.getElementById('change-password')
        const verifyBtn = document.getElementById('verify-otp')
        for (let x=0; x<otp.length; x++) token += otp[x].value
        data.token = token
        async function submitData() {
            verifyBtn.innerText = "Verifying..."; verifyBtn.setAttribute("disabled", "true"); verifyBtn.classList.add("disabled"); handleChange('disabled', true)
            btn.innerText = "Updating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.put(`${SERVER_URL}/account/user`, {...password, ...data}, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                closeModal('password-bg', 'password-modal'); closeModal('otp-bg', 'otp-modal')
                setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' }); setData({ tokenId: '', token: '', isBackupCode: false })
                for (let x=0; x<otp.length; x++) otp[x].value = ''
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
            })
            .catch(err => {
                document.getElementById('otp-token-1').focus()
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
            })
            verifyBtn.innerText = "Verify"; verifyBtn.removeAttribute("disabled"); verifyBtn.classList.remove("disabled")
            btn.innerText = "Update"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false)
        }
        if(!authenticated) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else if(!password.oldPassword || !password.newPassword || !password.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById(!password.oldPassword ? 'old-password' : !password.newPassword ? 'new-password' : 'confirm-password').focus()}
        else if(password.newPassword.length < 6 || password.confirmPassword.length < 6 || password.newPassword.length > 60 || password.confirmPassword.length > 60) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Provide a Password between 6 ~ 60 characters !'); document.getElementById(password.newPassword.length < 6 || password.newPassword.length > 60 ? 'new-password' : 'confirm-password').focus()}
        else if(password.newPassword !== password.confirmPassword) {setNotification(NOTIFICATION_TYPES.DANGER, 'Please Make Sure Both Passwords are Match !'); document.getElementById('confirm-password').focus()}
        else if(security['2FA']) {
            openModal('otp-bg', 'otp-modal')
            if(!data.isBackupCode && !data.tokenId)setNotification(NOTIFICATION_TYPES.DANGER, "Please Click on Send Verification Code to Proceed !")
            else if(!data.token) {setNotification(NOTIFICATION_TYPES.DANGER, "Authentication Required !"); openModal('otp-bg', 'otp-modal'); document.getElementById('otp-token-1').focus()}
            else if(data.token && !isNum.test(data.token)) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid OTP Code Format !"); document.getElementById('otp-token-1').focus()}
            else submitData()
        }
        else submitData()
    }

    const sendOTP = (e) => {
        e.preventDefault()
        const btn = document.getElementById('send-otp')
        const passwordBtn = document.getElementById('send-otp-pass')
        async function sendToken() {
            passwordBtn.innerText = "Sending..."; passwordBtn.setAttribute("disabled", "true"); passwordBtn.classList.add("disabled"); handleChange('disabled', true)
            btn.innerText = "Sending..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled")
            await axios.get(`${SERVER_URL}/account/otp`, { withCredentials: true })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
                handleData('tokenId', res.data.credentials.tokenId)
                document.getElementById('token-1').focus()
                document.getElementById('otp-token-1').focus()
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            passwordBtn.innerText = "Send Verification Code"; passwordBtn.removeAttribute("disabled"); passwordBtn.classList.remove("disabled")
            btn.innerText = "Send Verification Code"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false)
        }
        if(!authenticated) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else sendToken()
    }

    const VerifyOTP = (e) => {
        e.preventDefault()
        let token = ''
        const btn = document.getElementById('verify')
        const otp = document.querySelectorAll('#otp1 > *[id]')
        for (let x=0; x<otp.length; x++) token += otp[x].value
        data.token = token
        async function submitData(){
            btn.innerText = security['2FA'] ? "Deactivating..." : "Activating..."
            btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); handleChange('disabled', true)
            await axios.put(`${SERVER_URL}/account/otp`, data, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                closeModal('mfa-bg', 'mfa-modal')
                setData({ tokenId: '', token: '', isBackupCode: false })
                if(!userData.security['2FA']) userData.security['backup-codes'].valid = res.data['backup-codes']
                for (let x=0; x<otp.length; x++) otp[x].value = ''
                userData.security['2FA'] = !userData.security['2FA']
            })
            .catch(err => {
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message)
                document.getElementById('token-1').focus()
                document.getElementById('otp-token-1').focus()
            })
            btn.innerText = security['2FA'] ? "Deactivate" : "Activate"
            btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false)
        }
        if(properties.honeypot) return
        else if(!data.isBackupCode && !data.tokenId) setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.")
        else if(!data.token) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !"); document.getElementById('token-1').focus()}
        else if(!isNum.test(data.token)) {setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid OTP Code Format !"); document.getElementById('token-1').focus()}
        else submitData()
    }

    const RegenerateToken = (e) => {
        e.preventDefault()
        const btn = document.getElementById('generate-token')
        async function generateToken() {
            btn.innerText = "Generating..."; btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); handleChange('disabled', true)
            await axios.post(`${SERVER_URL}/account/backup-code`, { regenerate: true }, { headers: { 'XSRF-TOKEN': getCSRFToken() }, withCredentials: true })
            .then(res => {
                userData.security['backup-codes'].valid = res.data['backup-codes']
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message)
            })
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message))
            btn.innerText = "Regenerate Code"; btn.removeAttribute("disabled"); btn.classList.remove("disabled"); handleChange('disabled', false)
        }
        if(!security['2FA']) setNotification(NOTIFICATION_TYPES.WARNING, 'Backup Codes are only eligle for Two Factor Authentication (2FA) Users')
        else generateToken()
    }

    return (
        <div>
            { !authenticated ?
            (<div className="loader"><div className="spin-container"><div className="loading">
                <div></div><div></div><div></div>
                <div></div><div></div>
            </div></div></div>) : null }

            <div className="main">
                <div className="account-container">
                    <div className="flex35 center-object p-5p">
                        {properties.mfa ? null : <Skeleton variant="rect" animation="wave" className="center-object" width="100%" height="200px" />} <img className={properties.mfa ? '':'none'} src={Images['2FA']} alt="Introducing 2FA" onLoad={() => handleChange('mfa', true)} onError={e => { e.target.src=Images.local2FA }} />
                        <h2 className="isCentered mt-20 mb-20 monospace">Introducing 2FA</h2>
                        <p className="isCentered monospace">Two-Factor Authentication is a security control that requires users to verify their identities by providing multiple pieces of evidence before gaining access to a device or application.</p>
                    </div>
                    <div className="no-padding mb-40 flex65">
                        <div className="form__contact no-margin">
                            <div className="get_in_touch"><h1 className="monospace">Account</h1></div>
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="userEmail">Email Address</label>
                                    <input title="Email" id="userEmail" type="email" className="contact__inputField" minLength="6" maxLength="60" value={email} readOnly />
                                </div>
                            </div>
                            <div className="oauth-container">
                                <div className="m-10">
                                    <button className="oauth-box primary mt-20" onClick={() => openModal('password-bg', 'password-modal', 'old-password')}>
                                        <FontAwesomeIcon icon={faKeycdn} size='2x'/> <p>Update Password</p>
                                    </button>
                                </div>
                                <div className="m-10">
                                    <button className="oauth-box primary mt-20" onClick={() => window.location='/logout'}>
                                        <FontAwesomeIcon icon={faSignOutAlt} size='2x'/> <p>Sign Out</p>
                                    </button>
                                </div>
                            </div>
                            <div className="get_in_touch mt-40"><h1 className="monospace">Security</h1></div>
                            <div className="form"><div className="m-10">
                                <FormControlLabel control={
                                    <Switch checked={!isLoading ? security['2FA'] : false} onClick={() => !isLoading ? openModal('mfa-bg', 'mfa-modal') : null} color="primary"/>
                                } label="Two Factor Authentication (2FA)" />
                            </div></div>
                            { authenticated && security['2FA'] ?
                            (<div className="oauth-container">
                                <div className="m-10">
                                    <button className="oauth-box primary mt-20" onClick={() => openModal('backup-code-bg', 'backup-code-modal')}>
                                        <FontAwesomeIcon icon={faKey} size='2x'/> <p>Backup Codes</p>
                                    </button>
                                </div>
                            </div>) : null }
                            <div className="get_in_touch mt-40"><h1 className="monospace">Third Party</h1></div>
                            <div className="contact__container mt-10">
                                <p className="pr-10">
                                    <button className="oauth-box google mt-10 mb-10" onClick={() => authenticated && SERVER_URL ? window.location = `${SERVER_URL}/oauth/google/auth/connect` : null}>
                                        <FontAwesomeIcon icon={faGoogle} size='2x'/> {!isLoading && thirdParty && thirdParty.google ? <FontAwesomeIcon icon={faCheck} size='2x'/> : null } <p>{ thirdParty ? thirdParty.google ? <span><span id="connect">Connected</span><span id="disconnect">Disconnect</span></span> : 'Connect' : 'Connect' } with Google</p>
                                    </button>
                                </p>
                                <p className="pl-10">
                                    <button className="oauth-box github mt-10" onClick={() => authenticated && SERVER_URL ? window.location = `${SERVER_URL}/oauth/github/auth/connect` : null}>
                                        <FontAwesomeIcon icon={faGithub} size='2x'/> {!isLoading && thirdParty && thirdParty.github ? <FontAwesomeIcon icon={faCheck} size='2x'/> : null } <p>{ thirdParty ? thirdParty.github ? <span><span id="connect">Connected</span><span id="disconnect">Disconnect</span></span> : 'Connect' : 'Connect' } with GitHub</p>
                                    </button>
                                </p>
                            </div>
                            <hr className="mt-20"></hr>
                            <p className="isCentered mt-20 mb-20"><a className="link" href="https://github.com/stanleyowen/otlio" target="_blank" rel="noreferrer">GitHub</a> | <a className="link" href="https://otlio.statuspage.io/" target="_blank" rel="noopener">System Status</a> | <a className="link" href="/terms-and-conditions">Terms of Service</a> | <a className="link" href="/privacy-policy">Privacy Policy</a></p>
                            <p className="isCentered mt-20 mb-20 bold raleway">&copy; 2021 Otlio - All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="password-bg" className="modal hiddenModal">
                <div id="password-modal" className="modal__container hiddenModal">
                    <IconButton onClick={() => closeModal('password-bg', 'password-modal')} className="float-right"><FontAwesomeIcon icon={faTimes} style={{ fontSize: '.8em', color: 'black' }} /></IconButton>
                    <h2 className="modal__title">Update Password</h2>
                    <div className="modal__body">
                        <form onSubmit={changePassword}>
                            <input type="text" className="contact__inputField none" value={email} required readOnly autoComplete="username" />
                            <div className="m-10">
                                <div className="contact__infoField">
                                    <label htmlFor="old-password">Old Password</label>
                                    <input title="Old Password" id="old-password" type={ properties.password ? 'text':'password' } className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handlePassword('oldPassword', event.target.value)} value={password.oldPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.password ? 'off':'current-password'} />
                                    <span className="contact__onFocus" />
                                    <IconButton className="view-eye" onClick={() => handleChange('password', !properties.password)}>
                                        <FontAwesomeIcon icon={properties.password ? faEyeSlash : faEye} />
                                    </IconButton>
                                </div>
                            </div>
                            <div className="form__container">
                                <div className="m-10">
                                    <div className="contact__infoField">
                                        <label htmlFor="new-password">New Password</label>
                                        <input title="New Password" id="new-password" type={ properties.newPassword ? 'text':'password' } className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handlePassword('newPassword', event.target.value)} value={password.newPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.newPassword ? 'off':'new-password'} />
                                        <span className="contact__onFocus" />
                                        <IconButton className="view-eye" onClick={() => handleChange('newPassword', !properties.newPassword)} name="newPassword">
                                            <FontAwesomeIcon icon={properties.newPassword ? faEyeSlash : faEye} />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="m-10">
                                    <div className="contact__infoField">
                                        <label htmlFor="confirm-password">Confirm New Password</label>
                                        <input title="Confirm New Password" id="confirm-password" type={ properties.confirmPassword ? 'text':'password' } className="contact__inputField" minLength="6" maxLength="60" onChange={(event) => handlePassword('confirmPassword', event.target.value)} value={password.confirmPassword} spellCheck="false" autoCapitalize="none" required autoComplete={ properties.confirmPassword ? 'off':'new-password'} />
                                        <span className="contact__onFocus" />
                                        <IconButton className="view-eye" onClick={() => handleChange('confirmPassword', !properties.confirmPassword)} name="confirmPassword">
                                            <FontAwesomeIcon icon={properties.confirmPassword ? faEyeSlash : faEye} />
                                        </IconButton>
                                    </div>
                                </div>
                            </div>
                            <p className="isCentered mt-10"><a className="link" href="/reset-password">I forgot my password</a></p>
                            <button className="oauth-box google isCentered block mt-20 p-12 button" id="change-password">Update</button>
                        </form>
                    </div>
                </div>
            </div>

            <div id="mfa-bg" className="modal hiddenModal">
                <div id="mfa-modal" className="modal__container hiddenModal">
                    <IconButton onClick={() => closeModal('mfa-bg', 'mfa-modal')} className="float-right"><FontAwesomeIcon icon={faTimes} style={{ fontSize: '.8em', color: 'black' }} /></IconButton>
                    <h2 className="modal__title">Two Factor Authentication (2FA)</h2>
                    <div className="modal__body mt-10">
                        <ol className="ml-40 ul-mb10">
                            <li>
                                <span className="monospace">Send Verification Code</span>
                                <blockquote className="mt-20">
                                    <span><FontAwesomeIcon icon={faInfo} style={{ fontSize: '1.5em' }} /></span>
                                    <span className="info-title">Verification Code</span>
                                    <p className="mt-10">Verification Code will be sent to <b>{email}</b> via email and will be valid for only 5 (five) minutes. Once you enable 2 Factor Authentication (2FA), you will be prompted to enter verification code on every login session.</p>
                                </blockquote>
                                <button className="oauth-box google isCentered block mt-20 p-12 button" id="send-otp" onClick={sendOTP}>Send Verification Code</button>
                            </li>
                            <li className="mt-20">
                                <span className="monospace">Verify Identity</span>
                                <blockquote className="mt-20">
                                    <span><FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '1.5em' }} /></span>
                                    <span className="info-title">Account Recovery</span>
                                    <p className="mt-10">Note: If you do not have access to both your account or email, we are unable to remove 2FA and you will have to create a new account.</p>
                                </blockquote>
                                <form onSubmit={VerifyOTP}>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="token-1">{ data.isBackupCode ? 'Backup Code' : 'Verification Code' } <span className="required">*</span></label>
                                            <div id="otp1" className="otp flex-wrap justify-center isCentered">
                                                <input id="token-1" /><input id="token-2" /><input id="token-3" />
                                                <input id="token-4" /><input id="token-5" /><input id="token-6" />
                                                { data.isBackupCode ? ([<input id="token-7" />,<input id="token-8" />]) : null }
                                            </div>
                                        </div>
                                    </div>
                                    { authenticated && security['2FA'] ? (<p className="isCentered">If you're unable to receive a security code, use one of your <button type="button" className="link-btn link" onClick={() => {handleData('isBackupCode', !data.isBackupCode); document.getElementById('token-1').focus()}}>Backup Codes</button></p>) : null }
                                    <button className="oauth-box google isCentered block mt-20 p-12 button" id="verify">{ !isLoading ? security['2FA'] ? 'Deactivate' : 'Activate' : 'Activate' }</button>
                                </form>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            <div id="otp-bg" className="modal hiddenModal">
                <div id="otp-modal" className="modal__container hiddenModal">
                    <IconButton onClick={() => closeModal('otp-bg', 'otp-modal')} className="float-right"><FontAwesomeIcon icon={faTimes} style={{ fontSize: '.8em', color: 'black' }} /></IconButton>
                    <h2 className="modal__title">Authentication Required</h2>
                    <div className="modal__body mt-10">
                        <ol className="ml-40 ul-mb10">
                            <li>
                                Send Verification Code
                                <blockquote className="mt-20">
                                    <span><FontAwesomeIcon icon={faInfo} style={{ fontSize: '1.5em' }} /></span>
                                    <span className="info-title">Change Password</span>
                                    <p className="mt-10">In order to improve our services, qualities, and securities, we will need an <b>OTP Token</b> before users perform Change Password Request.</p>
                                </blockquote>
                                <button className="oauth-box google isCentered block mt-20 mb-10 p-12 button" id="send-otp-pass" onClick={sendOTP}>Send Verification Code</button>
                            </li>
                            <li>
                                Verify Identity
                                <form onSubmit={changePassword}>
                                    <div className="m-10">
                                        <div className="contact__infoField">
                                            <label htmlFor="otp-token-1">{ data.isBackupCode ? 'Backup Code' : 'Verification Code' } <span className="required">*</span></label>
                                            <div id="otp2" className="otp flex-wrap justify-center isCentered">
                                                <input id="otp-token-1" /><input id="otp-token-2" /><input id="otp-token-3" />
                                                <input id="otp-token-4" /><input id="otp-token-5" /><input id="otp-token-6" />
                                                { data.isBackupCode ? ([<input id="otp-token-7" />, <input id="otp-token-8" />]) : null }
                                            </div>
                                        </div>
                                    </div>
                                    <p className="isCentered">If you're unable to receive a security code, use one of your <button type="button" className="link-btn link" onClick={() => {handleData('isBackupCode', !data.isBackupCode); document.getElementById('otp-token-1').focus()}}>Backup Codes</button></p>
                                    <button className="oauth-box google isCentered block mt-20 mb-10 p-12 button" id="verify-otp">Verify</button>
                                </form>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            { authenticated && security['2FA'] ? (<textarea id="backup-codes" className="contact__inputField no-bot" value={BackupCode()} readOnly />) : null }
            { authenticated && security['2FA'] ?
            (<div id="backup-code-bg" className="modal hiddenModal">
                <div id="backup-code-modal" className="modal__container hiddenModal">
                    <IconButton onClick={() => closeModal('backup-code-bg', 'backup-code-modal')} className="float-right"><FontAwesomeIcon icon={faTimes} style={{ fontSize: '.8em', color: 'black' }} /></IconButton>
                    <h2 className="modal__title">Backup Codes</h2>
                    <div className="modal__body">
                        <p className="mb-10 monospace">Keep these backup codes somewhere safe but accessible. Each backup code can only be used once.</p>
                        <div className="monospace" dangerouslySetInnerHTML={{__html: sanitizer(BackupCodes())}}></div>
                        <button className="oauth-box google isCentered block mt-20 mb-10 p-12 button" id="generate-token" onClick={RegenerateToken}>Regenerate Token</button>
                        <div className="contact__container isCentered no-padding">
                            <p className="pr-10"><button className="oauth-box google isCentered block mt-10 mb-10 p-12 button" id="copy-code" onClick={CopyCode}>Copy to Clipboard</button></p>
                            <p className="pl-10"><button className="oauth-box google isCentered block mt-10 p-12 button" id="download-code" onClick={DownloadCode}>Download</button></p>
                        </div>
                    </div>
                </div>
            </div>) : null }
        </div>
    )
}

export default Account