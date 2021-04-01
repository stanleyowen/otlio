const axios = require('axios');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const passport = require('passport');
const nodemailer = require('nodemailer');
const JWTStrategy = require('passport-jwt').Strategy;
const localStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const MSG_DESC = require('./callback');
let User = require('../models/users.model');
let Token = require('../models/token.model');
let BlacklistedToken = require('../models/blacklisted-token.model');

const SALT_WORK_FACTOR = 12;
const jwtSecret = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_EMAIL,
      pass: process.env.MAIL_PASSWORD
    }
});

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use('register', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {confirmPassword} = req.body;
    if(!email || !password || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] })
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] })
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    else {
        User.findOne({email}, (err, user) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] })
            else if(user) return done(null, false, { status: 400, message: MSG_DESC[1] })
            else if(!user) {
                bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] })
                    else {
                        const newUser = new User ({ email, password: hash })
                        newUser.save()
                        .then(user => { return done(null, user, { status: 200, message: MSG_DESC[4] }) })
                        .catch(() => { return done(null, false, { status: 500, message: MSG_DESC[0] }) })
                    }
                })
            }
        })
    }
}))

passport.use('login', new localStrategy({ usernameField: 'email', passwordField: 'password', session: false }, (email, password, done) => {
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) done(null, false, { status: 400, message: MSG_DESC[10] });
        else if(user){
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                else if(!isMatch) return done(null, false, { status: 400, message: MSG_DESC[10] });
                else if(isMatch) return done(null, user, { status: 200, message: MSG_DESC[2] });
            })
        }
    })
}))

passport.use('editAccount', new localStrategy({ usernameField: 'email', passwordField: 'oldPassword', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {id, newPassword, confirmPassword} = req.body;
    if(!id || !password || !newPassword || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || newPassword.length < 6 || newPassword.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    else if(newPassword !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] });
    else {
        User.findOne({_id: id, email}, (err, user) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
            else if(!user) return done(null, false, { status: 401, message: MSG_DESC[10] });
            else if(user) {
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                    else if(!isMatch) return done(null, false, { status: 401, message: MSG_DESC[10] });
                    else if(isMatch){
                        bcrypt.hash(newPassword, SALT_WORK_FACTOR, (err, hash) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                            else {
                                const token = req.cookies['jwt-token']
                                BlacklistedToken.findOne({ token }, (err, isListed) => {
                                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                                    else if(isListed) return done(null, false, { status: 401, message: MSG_DESC[15] });
                                    else if(!isListed){
                                        const blacklistedToken = new BlacklistedToken ({ userId: id, token })
                                        user.password = hash;
                                        user.save()
                                        blacklistedToken.save()
                                        return done(null, user, { status: 200, message: MSG_DESC[6] });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}))

passport.use('forgetPassword', new localStrategy({ usernameField: 'email', passwordField: 'email', session: false }, (email, password, done) => {
    axios.get('https://api.ipify.org/?format=json')
    .then(res => {
        const ip = res.data.ip;
        Token.find({ ipAddr: ip }, (err, data) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
            else if(data && data.length >= 5) return done(null, false, { status: 403, message: MSG_DESC[30] });
            else if(!data || data.length <= 5){
                User.findOne({email}, (err, user) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                    else if(!user) return done(null, false, { status: 400, message: MSG_DESC[15] });
                    else {
                        const token = crypto.randomBytes(64).toString("hex");
                        const createToken = new Token({ ipAddr: ip, userId: user.id, token })
                        createToken.save();
                        var mailOptions = {
                            to: email,
                            subject: 'Password Reset',
                            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title></title> <!--[if (mso 16)]><style type="text/css">a{text-decoration:none}</style><![endif]--> <!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--> <!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--></head><body><div class="es-wrapper-color"> <!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f4f4f4"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-email-paddings" valign="top"><table cellpadding="0" cellspacing="0" class="es-content esd-header-popover" align="center"><tbody><tr><td class="esd-stripe" esd-custom-block-id="7962" align="center"><table class="es-content-body" style="background-color: transparent;" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-structure es-p15t es-p15b es-p10r es-p10l" align="left"> <!--[if mso]><table width="580" cellpadding="0" cellspacing="0"><tr><td width="282" valign="top"><![endif]--><table class="es-left" cellspacing="0" cellpadding="0" align="left"><tbody><tr><td class="esd-container-frame" width="282" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="es-infoblock esd-block-text es-m-txt-c" align="left"><p style="font-family: arial, helvetica neue, helvetica, sans-serif;">Todo Application<br></p></td></tr></tbody></table></td></tr></tbody></table> <!--[if mso]></td><td width="20"></td><td width="278" valign="top"><![endif]--><table class="es-right" cellspacing="0" cellpadding="0" align="right"><tbody><tr><td class="esd-container-frame" width="278" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td align="right" class="es-infoblock esd-block-text es-m-txt-c"><p><a href=${CLIENT_URL} class="view" target="_blank" style="font-family: 'arial', 'helvetica neue', 'helvetica', 'sans-serif';">View in browser</a></p></td></tr></tbody></table></td></tr></tbody></table> <!--[if mso]></td></tr></table><![endif]--></td></tr></tbody></table></td></tr></tbody></table><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: #7c72dc;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-structure es-p20t es-p10b es-p10r es-p10l" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="580" valign="top" align="center"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><a href=${CLIENT_URL} target="_blank"><img src="https://raw.githubusercontent.com/stanleyowen/todo-application/v0.4.3/client/public/logo512.png" alt style="display: block;" width="40"></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-stripe" style="background-color: #7c72dc;" esd-custom-block-id="6340" bgcolor="#7c72dc" align="center"><table class="es-content-body" style="background-color: transparent;" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-structure" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="600" valign="top" align="center"><table style="background-color: #ffffff; border-radius: 4px; border-collapse: separate;" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff"><tbody><tr><td class="esd-block-text es-p35t es-p5b es-p30r es-p30l" align="center"><h1>Password Reset</h1></td></tr><tr><td class="esd-block-spacer es-p5t es-p5b es-p20r es-p20l" bgcolor="#ffffff" align="center" style="font-size:0"><table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td style="border-bottom: 1px solid #ffffff; background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%; height: 1px; width: 100%; margin: 0px;"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"><tbody><tr><td class="esd-structure" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="600" valign="top" align="center"><table style="background-color: #ffffff;" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff"><tbody><tr><td class="esd-block-text es-m-txt-l es-p20t es-p15b es-p30r es-p30l" bgcolor="#ffffff" align="left"><p>Hi ${email}, we received a request to reset the password associated with this email address. Press the button below to reset the password. This is a one-time login, so it can be used only once. It expires after one hour and nothing will happen if it's not used.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td class="esd-structure es-p20b es-p30r es-p30l" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="540" valign="top" align="center"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-block-button es-p40t es-p40b es-p10r es-p10l" align="center"><span class="es-button-border"><a href="${CLIENT_URL}/reset-password?token=${token}&id=${user.id}" class="es-button" target="_blank">Reset Password</a></span></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td class="esd-structure es-p20t es-p30r es-p30l" align="left"><table cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td width="540" class="esd-container-frame" align="center" valign="top"><table cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td align="left" class="esd-block-text"><p><br></p></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-stripe" esd-custom-block-id="6344" align="center"><table class="es-content-body" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"><tbody><tr><td class="esd-structure" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="600" valign="top" align="center"><table style="border-radius: 4px; border-collapse: separate; background-color: #111111; color: white;" width="100%" cellspacing="0" cellpadding="0" bgcolor="#111111"><tbody><tr><td class="esd-block-text es-p20t es-p30r es-p30l es-m-txt-l" align="left"><p>Or you can also click on this link or copying and pasting it in your browser:</p></td></tr><tr><td align="center" class="esd-block-text"><p>${CLIENT_URL}/reset-password?token=${token}&id=${user.id}</p></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: transparent;" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-structure" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="600" valign="top" align="center"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-block-spacer es-p10t es-p20b es-p20r es-p20l" align="center" style="font-size:0"><table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td style="border-bottom: 1px solid #f4f4f4; background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%; height: 1px; width: 100%; margin: 0px;"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-stripe" esd-custom-block-id="6341" align="center"><table class="es-content-body" style="background-color: #c6c2ed;" width="600" cellspacing="0" cellpadding="0" bgcolor="#c6c2ed" align="center"><tbody><tr><td class="esd-structure" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="600" valign="top" align="center"><table style="border-radius: 4px; border-collapse: separate;" width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td align="center" class="esd-empty-container" style="display: none;"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table cellpadding="0" cellspacing="0" class="es-footer" align="center"><tbody><tr><td class="esd-stripe" esd-custom-block-id="6342" align="center"><table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-structure es-p30t es-p30b es-p30r es-p30l" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="540" valign="top" align="center"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td align="center" class="esd-empty-container" style="display: none;"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table class="esd-footer-popover es-content" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: transparent;" width="600" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="esd-structure es-p30t es-p30b es-p20r es-p20l" align="left"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-container-frame" width="560" valign="top" align="center"><table width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="esd-block-image es-infoblock made_with" align="center" style="font-size: 0px;"><a target="_blank" href="${CLIENT_URL}"><img src="https://raw.githubusercontent.com/stanleyowen/todo-application/v0.4.3/client/public/logo512.png" alt width="125" style="display: block;"></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></body></html>`
                        };
                        transporter.sendMail(mailOptions, (err, info) => {
                            if(err) done(null, false, { status: 500, message: MSG_DESC[0] });
                            else if(info) done(null, false, { status: 200, message: MSG_DESC[29] });
                        });
                    }
                })
            }
        })
    })
    .catch(err => { return done(null, false, { status: 400, message: MSG_DESC[11] }); })
}))

passport.use('getForgetPasswordData', new localStrategy({ usernameField: 'token', passwordField: 'id', session: false }, (token, id, done) => {
    Token.findOne({token, userId: id}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) return done(null, false, { status: 400, message: MSG_DESC[10] });
        else if(user){
            User.findById(id, (err, user) => {
                if(err) done(null, false, { status: 500, message: MSG_DESC[0] });
                else if(!user) return done(null, false, { status: 400, message: MSG_DESC[10] });
                else if(user) return done(null, user, { status: 200, message: MSG_DESC[5] });
            })
        }
    })
}))

passport.use('resetPassword', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {id, token, confirmPassword} = req.body;
    if(!id || !token || !email || !password || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    else {
        Token.findOneAndDelete({token, userId: id}, (err, token) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
            else if(!token) return done(null, false, { status: 400, message: MSG_DESC[10] });
            else if(token){
                User.findOne({_id: id, email}, (err, user) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                    else if(!user) return done(null, false, { status: 400, message: MSG_DESC[8] });
                    else if(user) {
                        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                            else {
                                bcrypt.hash(password, salt, (err, hash) => {
                                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                                    else {
                                        user.password = hash;
                                        user.save()
                                        return done(null, user, { status: 200, message: MSG_DESC[6] });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}))

passport.use('github', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: process.env.GITHUB_CALLBACK }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user){
            const dataModel = new User ({
                email,
                password: null,
                thirdParty: {
                    isThirdParty: true,
                    provider: 'github',
                    status: 'Pending'
                }
            });
            dataModel.save()
            return done(null, user, { status: 302, type: 'redirect', url: `/auth/github/${encodeURIComponent(email)}` })
        }else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.provider === "github" && user.thirdParty.status === "Pending") return done(null, user, { status: 302, type: 'redirect', url: `/auth/github/${encodeURIComponent(email)}` })
            else if(user.thirdParty.isThirdParty && user.thirdParty.provider === "github" && user.thirdParty.status === "Success"){
                return done(null, user, { status: 200 })
            }else if(user.thirdParty.isThirdParty) return done(null, false, { status: 400, message: MSG_DESC[28] });
            else return done(null, false, { status: 400, message: MSG_DESC[16] });
        }
    })
}))

passport.use('connectViaGithub', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: `${process.env.GITHUB_CALLBACK}/connect` }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) return done(null, false, { status: 401, message: MSG_DESC[16] });
        else if(user) return done(null, user, { status: 200 })
    })
}))

passport.use('google', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: process.env.GOOGLE_CALLBACK }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user){
            const dataModel = new User ({
                email,
                password: null,
                thirdParty: {
                    isThirdParty: true,
                    provider: 'google',
                    status: 'Pending'
                }
            });
            dataModel.save()
            return done(null, user, { status: 302, type: 'redirect', url: `/auth/google/${encodeURIComponent(email)}` })
        }else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.provider === "google" && user.thirdParty.status === "Pending") return done(null, user, { status: 302, type: 'redirect', url: `/auth/google/${encodeURIComponent(email)}` })
            else if(user.thirdParty.isThirdParty && user.thirdParty.provider === "google" && user.thirdParty.status === "Success"){
                return done(null, user, { status: 200 })
            }else if(user.thirdParty.isThirdParty) return done(null, false, { status: 400, message: MSG_DESC[28] });
            else return done(null, false, { status: 400, message: MSG_DESC[16] });
        }
    })
}))

passport.use('connectViaGoogle', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: `${process.env.GOOGLE_CALLBACK}?connect=true` }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) return done(null, false, { status: 401, message: MSG_DESC[16] });
        else if(user) return done(null, user, { status: 200 })
    })
}))

passport.use('getOAuthData', new localStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const provider = req.params.provider;
    if(!provider) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] });
    User.findOne({email, 'thirdParty.provider': provider }, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) done(null, false, { status: 400, message: MSG_DESC[13] });
        else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.status === "Pending"){
                return done(null, user, { status: 200, message: true })
            }else done(null, false, { status: 400, message: MSG_DESC[13] });
        }
    })
}))

passport.use('registerOAuth', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const provider = req.params.provider;
    if(!provider) return done(null, false, { status: 400, message: MSG_DESC[3] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[4] });
    else if(password.length < 6 || password.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    User.findOne({email, 'thirdParty.provider': provider }, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) done(null, false, { status: 400, message: MSG_DESC[13] });
        else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.status === "Pending"){
                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                    else {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                            else {
                                user.password = hash;
                                user.thirdParty.status = "Success";
                                user.save()
                                .then(user => { return done(null, user, { status: 200, message: MSG_DESC[4] }) })
                                .catch(() => { return done(null, false, { status: 500, message: MSG_DESC[0] }) })
                            }
                        })
                    }
                })
            }else done(null, false, { status: 400, message: MSG_DESC[13] });
        }
    })
}))

const extractJWT = (req) => {
    var token = null;
    if(req.cookies) token = req.cookies['jwt-token'];
    return token;
}

const opts = {
    jwtFromRequest: extractJWT,
    secretOrKey: jwtSecret,
};

passport.use('jwt', new JWTStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id, (err, user) => {
        if(err) done(null, false);
        else if(user) done(null, user);
        else done(null, false);
    })
}))

module.exports = passport;