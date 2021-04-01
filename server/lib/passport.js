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
                                        const mailOptions = {
                                            to: email,
                                            subject: '[TodoApp] Password Changed',
                                            html: `Hello ${email},<br><br>We wanted to inform that your Todo Application password has changed.<br><br> If you did not perform this action, you can recover access by entering stanleyowen06@gmail.com into the form at ${CLIENT_URL}/forget-password<br><br> Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`
                                        };
                                        transporter.sendMail(mailOptions, (err, info) => {
                                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                                            else if(info) return done(null, user, { status: 200, message: MSG_DESC[6] });
                                        });
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
                        const mailOptions = {
                            to: email,
                            subject: '[TodoApp] Password Reset',
                            html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--[if IE]><style type="text/css">a{text-decoration:none;color:black!important}</style><![endif]--> <!--[if (mso 16)]><style type="text/css">a{text-decoration:none}</style><![endif]--> <!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--> <!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--></head><body><div class="es-wrapper-color"> <!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f4f4f4"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/todo-application/v0.4.3/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Need to reset your password? No problem! Just click the button below to reset your password!</p><div style="display: block; width: 100%; text-align: center; margin: 30px 0;"> <a href="${CLIENT_URL}/reset-password?token=${token}&id=${user.id}" style="padding: 15px 30px; background-color: rgb(8 72 179); color: white; text-decoration: none; border-radius: 5px; font-family: Cambria, Georgia, Times, 'Times New Roman', serif; font-weight: bold;">Reset your password</a></div><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">This link will expires after one hour. To get a new password reset link, visit:<br>${CLIENT_URL}/forget-password</p><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Best Regards,<br>Stanley Owen</p></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because a password reset was requested for your account.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
                        };
                        transporter.sendMail(mailOptions, (err, info) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                            else if(info) return done(null, false, { status: 200, message: MSG_DESC[29] });
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