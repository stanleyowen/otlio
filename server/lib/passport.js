const axios = require('axios');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const passport = require('passport');
const nodemailer = require('nodemailer');
const JWTStrategy = require('passport-jwt').Strategy;
const localStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const { encrypt, decrypt } = require('../lib/crypto');

const MSG_DESC = require('./callback');
let User = require('../models/users.model');
let Todo = require('../models/todo.model');
let Token = require('../models/token.model');
let OTPToken = require('../models/otp-token.model')
let RevokedToken = require('../models/revoke-token.model');

const SALT_WORK_FACTOR = 12;
const jwtSecret = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_EMAIL,
      pass: process.env.MAIL_PASSWORD
    }
});

const listLabel = ["Priority","Secondary","Important","Do Later"];

const validateLabel = (e) => {
    for (a=0; listLabel.length; a++){
        if(e === listLabel[a].toLowerCase()) return false;
        else if(a === listLabel.length-1 && e !== listLabel[a].toLowerCase()) return true;
    }
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use('register', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {confirmPassword} = req.body;
    if(!confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] })
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] })
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    else {
        User.findOne({email}, (err, user) => {
            if(err) return done(err, false);
            else if(!user) {
                bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
                    if(err) return done(err, false);
                    else new User ({ email, password: hash }).save((err, data) => {
                            if(err) return done(err, false);
                            else return done(null, data, { status: 200, message: MSG_DESC[4] })
                        })
                })
            }else return done(null, false, { status: 400, message: MSG_DESC[1] })
        })
    }
}))

passport.use('login', new localStrategy({ usernameField: 'email', passwordField: 'password', session: false }, (email, password, done) => {
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false);
        else if(user){
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) return done(err, false);
                else if(isMatch) return done(null, user, { status: 200, message: MSG_DESC[2] });
                else return done(null, false, { status: 400, message: MSG_DESC[10] });
            })
        }else done(null, false, { status: 400, message: MSG_DESC[10] });
    })
}))

passport.use('changePassword', new localStrategy({ usernameField: 'email', passwordField: 'oldPassword', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {id, newPassword, confirmPassword} = req.body;
    if(!id || !newPassword || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || newPassword.length < 6 || newPassword.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    else if(newPassword !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] });
    else {
        User.findOne({ _id: id, email }, (err, user) => {
            if(err) return done(err, false);
            else if(user) {
                bcrypt.compare(password, user.password, (err, match) => {
                    if(err) return done(err, false);
                    else if(match){
                        bcrypt.hash(newPassword, SALT_WORK_FACTOR, (err, hash) => {
                            if(err) return done(err, false);
                            else {
                                new RevokedToken ({ userId: id, token: encrypt(req.cookies['jwt-token'], 1) }).save()
                                user.password = hash; user.save()
                                const mailOptions = {
                                    to: email,
                                    replyTo: process.env.MAIL_REPLY_TO,
                                    subject: '[TodoApp] Password Changed',
                                    html: `Hi ${email},<br><br>We wanted to inform that your Todo Application password has changed.<br><br> If you did not perform this action, you can recover access by entering ${email} into the form at ${CLIENT_URL}/reset-password<br><br> Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`
                                };
                                transporter.sendMail(mailOptions, (err) => {
                                    if(err) done(err, false);
                                    else return done(null, user, { status: 200, message: MSG_DESC[6] });
                                });
                            }
                        })
                    }else return done(null, false, { status: 401, message: MSG_DESC[10] });
                })
            }else return done(null, false, { status: 401, message: MSG_DESC[10] });
        })
    }
}))

passport.use('forgotPassword', new localStrategy({ usernameField: 'email', passwordField: 'captcha', session: false }, (email, token, done) => {
    axios.get('https://api.ipify.org/?format=json')
    .then(async res => {
        const ip = res.data.ip;
        const query = {
            secret: CAPTCHA_SECRET,
            response: token,
            remoteip: ip
        }
        await axios.get('https://google.com/recaptcha/api/siteverify', { params: query })
        .then(res => {
            if(res.data.success){
                Token.find({ ipAddr: ip, 'type.passwordReset': true }, (err, data) => {
                    if(err) return done(err, false);
                    else if(data && data.length >= 5) return done(null, false, { status: 403, message: MSG_DESC[30] });
                    else if(!data || data.length < 5){
                        User.findOne({ email }, (err, user) => {
                            if(err) return done(err, false);
                            else if(!user) return done(null, false, { status: 400, message: MSG_DESC[32] });
                            else {
                                const id = user.id;
                                const token = crypto.randomBytes(120).toString("hex");
                                new Token({ ipAddr: ip, 'type.passwordReset': true, userId: encrypt(id, 1), token: encrypt(token, 1) }).save((err, data) => {
                                    if(err) return done(err, false);
                                    else {
                                        const mailOptions = {
                                            to: email,
                                            subject: '[TodoApp] Password Reset',
                                            html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--[if IE]><style type="text/css">a{text-decoration:none;color:black!important}</style><![endif]--> <!--[if (mso 16)]><style type="text/css">a{text-decoration:none}</style><![endif]--> <!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--> <!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--></head><body><div class="es-wrapper-color"> <!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f4f4f4"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/todo-application/v0.4.3/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Need to reset your password? No problem! Just click the button below to reset your password!</p><div style="display: block; width: 100%; text-align: center; margin: 30px 0;"> <a href="${CLIENT_URL}/reset-password/${id}-${data.id}/${token}" style="padding: 15px 30px; background-color: rgb(8 72 179); color: white; text-decoration: none; border-radius: 5px; font-family: Cambria, Georgia, Times, 'Times New Roman', serif; font-weight: bold;">Reset your password</a></div><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">This link will expires after one hour. To get a new password reset link, visit:<br>${CLIENT_URL}/reset-password</p><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Best Regards,<br>Todo Application</p></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because a password reset was requested for your account.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
                                        };
                                        transporter.sendMail(mailOptions, (err) => {
                                            if(err) return done(err, false);
                                            else return done(null, user, { status: 200, message: MSG_DESC[29] });
                                        });
                                    }
                                });
                            }
                        })
                    }
                })
            }else return done(null, false, { status: 403, message: MSG_DESC[33] })
        })
        .catch(err => { return done(err, false) })
    })
    .catch(err => { return done(err, false); })
}))

passport.use('tokenData', new localStrategy({ usernameField: 'id', passwordField: 'token', passReqToCallback: true, session: false }, (req, id, token, done) => {
    const {type} = req.params;
    const userId = id.split('-')[0];
    const tokenId = id.split('-')[1];
    var query = {};
    query['_id'] = tokenId; query['type.'.concat(type)] = true;
    Token.findOne(query, (err, user) => {
        if(err) return done(err, false);
        else if(user && userId === decrypt(user.userId, 1) && token === decrypt(user.token, 1)){
            User.findById(userId, (err, user) => {
                if(err) done(err, false);
                else if(user) return done(null, user, { status: 200, message: MSG_DESC[5] });
                else return done(null, false, { status: 400, message: MSG_DESC[31] });
            })
        }else return done(null, false, { status: 400, message: MSG_DESC[31] });
    })
}))

passport.use('resetPassword', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {id, type, token, confirmPassword} = req.body;
    if(!id || !token || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    else {
        const userId = id.split('-')[0];
        const tokenId = id.split('-')[1];
        var query = {};
        query['_id'] = tokenId; query['type.'.concat(type)] = true;
        Token.findOne(query, (err, data) => {
            if(err) done(err, false);
            else if(data && token === decrypt(data.token, 1) && userId === decrypt(data.userId, 1)){
                bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
                    if(err) return done(err, false);
                    else {
                        User.findOneAndUpdate({_id: userId, email}, { password: hash }, (err, user) => {
                            if(err) done(err, false);
                            else if(user) {
                                data.remove();
                                const mailOptions = {
                                    to: email,
                                    replyTo: process.env.MAIL_REPLY_TO,
                                    subject: '[TodoApp] Password Changed',
                                    html: `Hi ${email},<br><br>We wanted to inform that your Todo Application password has changed.<br><br> If you did not perform this action, you can recover access by entering ${email} into the form at ${CLIENT_URL}/reset-password<br><br> Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`
                                };
                                transporter.sendMail(mailOptions, (err) => {
                                    if(err) return done(err, false);
                                    else return done(null, user, { status: 200, message: MSG_DESC[6] });
                                });
                            }else return done(null, false, { status: 401, message: MSG_DESC[10] });
                        })
                    }
                })
            }else return done(null, false, { status: 400, message: MSG_DESC[32] });
        })
    }
}))

passport.use('verifyAccount', new localStrategy({ usernameField: 'email', passwordField: 'id', session: false }, (email, id, done) => {
    axios.get('https://api.ipify.org/?format=json')
    .then(async res => {
        const ip = res.data.ip;
        Token.find({ ipAddr: ip }, (err, data) => {
            if(err) return done(err, false);
            else if(data && data.length >= 5) return done(null, false, { status: 403, message: MSG_DESC[30] });
            else if(!data || data.length < 5){
                User.findOne({ _id: id, email, verified: false }, (err, user) => {
                    if(err) return done(err, false);
                    else if(!user) return done(null, false, { status: 400, message: MSG_DESC[32] });
                    else {
                        const token = crypto.randomBytes(120).toString("hex");
                        new Token({ ipAddr: ip, 'type.accountVerification': true, userId: encrypt(id, 1), token: encrypt(token, 1) }).save((err, data) => {
                            if(err) return done(err, false);
                            else {
                                const mailOptions = {
                                    to: email,
                                    subject: '[TodoApp] Account Verification',
                                    html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--[if (mso 16)]><style type="text/css">a{text-decoration:none;}</style><![endif]--><!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--><!--[if gte mso 9]> <xml><o:OfficeDocumentSettings><o:AllowPNG></o:AllowPNG><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--></head><body><div class="es-wrapper-color"><!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"><v:fill type="tile" color="#f4f4f4"></v:fill></v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/todo-application/v0.4.3/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-align: center;">Verify Email</h2><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Thanks for creating account in Todo Application. You're almost done - we just need to verify your email.</p><div style="display: block; width: 100%; text-align: center; margin: 30px 0;"><a href="${CLIENT_URL}/verify/${id}-${data.id}/${token}" style="padding: 15px 30px; background-color: rgb(8 72 179); color: white; text-decoration: none; border-radius: 5px; font-family: Cambria, Georgia, Times, 'Times New Roman', serif; font-weight: bold;">Verify Email</a></div><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">This link will expires after one hour. To get a account verification link, please request it through Account Settings.</p><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Best Regards,<br>Todo Application</p></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because your email was provided for registration on Todo Application.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
                                };
                                transporter.sendMail(mailOptions, (err) => {
                                    if(err) return done(err, false);
                                    else return done(null, user, { status: 200, message: MSG_DESC[35] });
                                });
                            }
                        });
                    }
                })
            }
        })
        .catch(err => { return done(err, false) })
    })
    .catch(err => { return done(err, false); })
}))

passport.use('verifyUser', new localStrategy({ usernameField: 'id', passwordField: 'token', passReqToCallback: true, session: false }, (req, id, token, done) => {
    const {type} = req.params;
    const userId = id.split('-')[0];
    const tokenId = id.split('-')[1];
    var query = {};
    query['_id'] = tokenId; query['type.'.concat(type)] = true;
    Token.findOne(query, (err, data) => {
        if(err) return done(err, false);
        else if(data && userId === decrypt(data.userId, 1) && token === decrypt(data.token, 1)){
            User.findById(userId, (err, user) => {
                if(err) done(err, false);
                else if(user){
                    user.verified = true;
                    user.save(); data.remove();
                    return done(null, user, { status: 200, message: MSG_DESC[5] });
                }
                else return done(null, false, { status: 400, message: MSG_DESC[31] });
            })
        }else return done(null, false, { status: 400, message: MSG_DESC[31] });
    })
}))

passport.use('github', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: process.env.GITHUB_CALLBACK }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false);
        else if(!user){
            new User ({
                email,
                password: null,
                thirdParty: {
                    isThirdParty: true,
                    github: true
                }
            }).save();
            return done(null, false, { status: 302, type: 'redirect', url: `/auth/github/${encodeURIComponent(email)}` })
        }else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.github && !user.thirdParty.verified) return done(null, false, { status: 302, type: 'redirect', url: `/auth/github/${encodeURIComponent(email)}` });
            else if(user.thirdParty.isThirdParty && user.thirdParty.github && user.thirdParty.verified) return done(null, user, { status: 200, message: MSG_DESC[5] });
            else return done(null, false, { status: 403, message: MSG_DESC[16] });
        }
    })
}))

passport.use('connectGitHub', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: `${process.env.GITHUB_CALLBACK}/connect`, passReqToCallback: true }, (req, accessToken, refreshToken, profile, done) => {
    const {id, email} = req.body;
    User.findOne({email: profile._json.email, 'thirdParty.github': false}, (err, user) => {
        if(err) return done(err, false);
        else if(user && id === user.id && email === user.email){
            user.thirdParty.isThirdParty = true
            user.thirdParty.github = true
            user.thirdParty.verified = true
            user.save()
            return done(null, user, { status: 200, message: MSG_DESC[26] });
        }else return done(null, false, { status: 403, message: MSG_DESC[27] });
    })
}))

passport.use('google', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: process.env.GOOGLE_CALLBACK }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false);
        else if(!user){
            new User ({
                email,
                password: null,
                thirdParty: {
                    isThirdParty: true,
                    google: true
                }
            }).save();
            return done(null, false, { status: 302, type: 'redirect', url: `/auth/google/${encodeURIComponent(email)}` })
        }else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.google && !user.thirdParty.verified) return done(null, false, { status: 302, type: 'redirect', url: `/auth/google/${encodeURIComponent(email)}` });
            else if(user.thirdParty.isThirdParty && user.thirdParty.google && user.thirdParty.verified) return done(null, user, { status: 200, message: MSG_DESC[5] });
            else return done(null, false, { status: 403, message: MSG_DESC[16] });
        }
    })
}))

passport.use('connectGoogle', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: `${process.env.GOOGLE_CALLBACK}/connect`, passReqToCallback: true }, (req, accessToken, refreshToken, profile, done) => {
    const {id, email} = req.body;
    User.findOne({email: profile._json.email, 'thirdParty.google': false}, (err, user) => {
        if(err) return done(err, false);
        else if(user && id === user.id && email === user.email){
            user.thirdParty.isThirdParty = true
            user.thirdParty.google = true
            user.thirdParty.verified = true
            user.save()
            return done(null, user, { status: 200, message: MSG_DESC[24] });
        }else return done(null, false, { status: 403, message: MSG_DESC[25] });
    })
}))

passport.use('getOAuthData', new localStrategy({ usernameField: 'email', passwordField: 'provider', session: false }, (email, provider, done) => {
    if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else {
        var query = {};
        query['email'] = email; query['thirdParty.'.concat(provider)] = true; query['thirdParty.verified'] = false;
        User.findOne(query, (err, user) => {
            if(err) return done(err, false);
            else if(user) return done(null, user, { status: 200, message: MSG_DESC[5] });
            else done(null, false, { status: 401, message: MSG_DESC[10] });
        })
    }
}))

passport.use('registerOAuth', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {provider, confirmPassword} = req.body;
    if(!provider || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[3] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] })
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    else {
        bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
            if(err) return done(err, false);
            else {
                var query = {};
                query['email'] = email; query['thirdParty.'.concat(provider)] = true; query['thirdParty.verified'] = false;
                User.findOneAndUpdate(query, { password: hash, 'thirdParty.verified': true }, (err, user) => {
                    if(err) return done(err, false);
                    else if(user) return done(null, user, { status: 200, message: MSG_DESC[4] });
                    else done(null, false, { status: 401, message: MSG_DESC[10] });
                })
            }
        })
    }
}))

passport.use('sendOTP', new localStrategy({ usernameField: 'email', passwordField: 'id', session: false }, (email, id, done) => {
    axios.get('https://api.ipify.org/?format=json')
    .then(async res => {
        const ip = res.data.ip;
        OTPToken.find({ ipAddr: ip }, (err, data) => {
            if(err) return done(err, false);
            else if(data && data.length >= 5) return done(null, false, { status: 403, message: MSG_DESC[30] });
            else if(!data || data.length < 5){
                User.findOne({ _id: id, email, 'security.2FA': true }, (err, user) => {
                    if(err) return done(err, false);
                    else if(!user) return done(null, false, { status: 400, message: MSG_DESC[32] });
                    else {
                        const token = crypto.randomBytes(3).toString("hex");
                        new OTPToken({ ipAddr: ip, userId: encrypt(id, 2), token: encrypt(token, 2) }).save((err, data) => {
                            if(err) return done(err, false);
                            else{
                                const mailOptions = {
                                    to: email,
                                    subject: '[TodoApp] One Time Password',
                                    html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--[if IE]><style type="text/css">a{text-decoration:none;color:black!important}</style><![endif]--> <!--[if (mso 16)]><style type="text/css">a{text-decoration:none}</style><![endif]--> <!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--> <!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--></head><body><div class="es-wrapper-color"> <!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f4f4f4"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/todo-application/v0.4.3/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-align: center;">One Time Password</h2><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Your One Time Password (OTP):</p><h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-align: center;">${token}</h2></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because Two Factor Authentication is enabled.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
                                };
                                transporter.sendMail(mailOptions, (err) => {
                                    if(err) return done(err, false);
                                    else return done(null, { email: user.email, id: user.id, tokenId: data.id }, { status: 200, message: MSG_DESC[36] });
                                });
                            }
                        });
                    }
                })
            }
        })
        .catch(err => { return done(err, false) })
    })
    .catch(err => { return done(err, false); })
}))

passport.use('verifyOTP', new localStrategy({ usernameField: 'tokenId', passwordField: 'token', passReqToCallback: true, session: false }, (req, tokenId, token, done) => {
    const id = req.body._id;
    OTPToken.findById(tokenId, (err, data) => {
        if(err) return done(err, false);
        else if(!data) return done(null, false, { status: 400, message: MSG_DESC[32] });
        else if(data && id == decrypt(data.userId, 2) && token === decrypt(data.token, 2)){
            data.remove();
            return done(null, req.body, { status: 200, message: MSG_DESC[5] })
        }else return done(null, false, { status: 400, message: MSG_DESC[38] });
    })
    .catch(err => { return done(err, false) })
}))

passport.use('todoData', new localStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallback: true, session: false }, (req, email, id, done) => {
    if(req.query.id){
        Todo.findOne({ _id: req.query.id, email }, (err, data) => {
            if(err) return done(err, false);
            else if(!data) return done(err, null, {status: 404, message: MSG_DESC[13]});
            else if(data){
                const todoData = {
                    _id: data.id,
                    email: data.email,
                    title: decrypt(data.title, 1),
                    label: decrypt(data.label, 1),
                    description: data.description.data === '' ? '' : decrypt(data.description, 1),
                    date: decrypt(data.date, 1)
                };
                return done(null, todoData)
            }
        })
    }else {
        Todo.find({ email }, (err, data) => {
            if(err) return done(err, false);
            else {
                let todoData = [];
                for (let x=0; x<data.length; x++){
                    const loopData = {
                        _id: data[x]._id,
                        email: data[x].email,
                        title: decrypt(data[x].title, 1),
                        label: decrypt(data[x].label, 1),
                        description: data[x].description.data === '' ? '' : decrypt(data[x].description, 1),
                        date: decrypt(data[x].date, 1)
                    };
                    todoData.push(loopData);
                } return done(null, todoData)
            }
        })
    }
}))

passport.use('addTodo', new localStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallback: true, session: false }, (req, email, id, done) => {
    const {title, label, description, date} = req.body;
    if(!title || !label || !date) return res.status(400).json({statusCode: 400, message: MSG_DESC[11]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return res.status(400).json({statusCode: 400, message: MSG_DESC[8]});
    else if(title.length > 40) return res.status(400).json({statusCode: 400, message: MSG_DESC[17]});
    else if(validateLabel(label)) return res.status(400).json({statusCode: 400, message: MSG_DESC[18]});
    else if(description && description.length > 120) return res.status(400).json({statusCode: 400, message: MSG_DESC[19]});
    else {
        new Todo({
            email,
            title: encrypt(title, 1),
            label: encrypt(label, 1),
            description: description ? encrypt(description, 1) : { data: '', iv: '' },
            date: encrypt(date, 1)
        }).save((err, data) => {
            if(err) done(err, null);
            else return done(null, data, {status: 200, message: MSG_DESC[23]});
        })
    }
}))

passport.use('updateTodo', new localStrategy({ usernameField: 'email', passwordField: 'id', passReqToCallback: true, session: false }, (req, email, id, done) => {
    const {title, label, description, date} = req.body;
    if(!title || !label || !date) return res.status(400).json({statusCode: 400, message: MSG_DESC[11]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return res.status(400).json({statusCode: 400, message: MSG_DESC[8]});
    else if(title.length > 40) return res.status(400).json({statusCode: 400, message: MSG_DESC[17]});
    else if(validateLabel(label)) return res.status(400).json({statusCode: 400, message: MSG_DESC[18]});
    else if(description && description.length > 120) return res.status(400).json({statusCode: 400, message: MSG_DESC[19]});
    else {
        const data = {
            title: encrypt(title, 1),
            label: encrypt(label, 1),
            description: description ? encrypt(description, 1) : { data: '', iv: '' },
            date: encrypt(date, 1)
        }
        Todo.findOneAndUpdate({ _id: id, email }, data, (err, data) => {
            if(err) return done(err, false);
            else if(data) return done(null, data, { status: 200, message: MSG_DESC[21] })
            else return done(null, false, { status: 403, message: MSG_DESC[16] })
        })
    }
}))

passport.use('deleteTodo', new localStrategy({ usernameField: 'email', passwordField: 'objId', session: false }, (email, id, done) => {
    Todo.findOneAndDelete({ _id: id, email }, (err, data) => {
        if(err) return done(err, false);
        else if(data) return done(null, data, { status: 200, message: MSG_DESC[22] });
        else return done(null, false, { status: 403, message: MSG_DESC[16] })
    })
}))

const opts = {
    jwtFromRequest: req => req.cookies['jwt-token'],
    secretOrKey: jwtSecret,
    passReqToCallback: true
};

passport.use('jwt', new JWTStrategy(opts, (req, payload, done) => {
    User.findOne({ _id: payload.id, email: payload.email, 'security.2FA': payload.auth['2FA'] }, (err, user) => {
        if(err) return done(err, false);
        else if(user){
            if(user.security['2FA'] === payload.auth.status){
                RevokedToken.find({ userId: user.id }, (err, data) => {
                    if(err) return done(err, false);
                    else if(data.length){
                        for (x=0; data.length; x++){
                            if(decrypt(data[x].token, 1) === req.cookies['jwt-token']) return done(null, false, { status: 403, message: MSG_DESC[15] });
                            else if(x === data.length-1 && decrypt(data[x].token, 1) !== req.cookies['jwt-token']) return done(null, user);
                        }
                    }else if(!data.length) return done(null, user);
                })
            }else return done(null, false, { status: 200, message: MSG_DESC[37] })
        }else return done(null, false, { status: 401, message: MSG_DESC[16] });
    })
}))

passport.use('jwtOTP', new JWTStrategy(opts, (req, payload, done) => {
    User.findOne({ _id: payload.id, email: payload.email, 'security.2FA': payload.auth['2FA'] }, (err, user) => {
        if(err) return done(err, false);
        else if(user){
            RevokedToken.find({ userId: user.id }, (err, data) => {
                if(err) return done(err, false);
                else if(data.length){
                    for (x=0; data.length; x++){
                        if(decrypt(data[x].token, 1) === req.cookies['jwt-token']) return done(null, false, { status: 403, message: MSG_DESC[15] });
                        else if(x === data.length-1 && decrypt(data[x].token, 1) !== req.cookies['jwt-token']) return done(null, user);
                    }
                }else if(!data.length) return done(null, user);
            })
        }else return done(null, false, { status: 401, message: MSG_DESC[16] });
    })
}))

module.exports = passport;