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
let Token = require('../models/token.model');
let BlacklistedToken = require('../models/blacklisted-token.model');

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

passport.use('changePassword', new localStrategy({ usernameField: 'email', passwordField: 'oldPassword', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {id, newPassword, confirmPassword} = req.body;
    if(!id || !newPassword || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || newPassword.length < 6 || newPassword.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    else if(newPassword !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] });
    else {
        User.findOne({ _id: id, email }, (err, user) => {
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
                                new BlacklistedToken ({ userId: id, token: encrypt(req.cookies['jwt-token']) }).save((err) => {
                                    console.log(err)
                                })
                                user.password = hash;
                                user.save()
                                return done(null, user, { status: 200, message: MSG_DESC[6] });
                                // const mailOptions = {
                                //     to: email,
                                //     replyTo: process.env.MAIL_REPLY_TO,
                                //     subject: '[TodoApp] Password Changed',
                                //     html: `Hi ${email},<br><br>We wanted to inform that your Todo Application password has changed.<br><br> If you did not perform this action, you can recover access by entering ${email} into the form at ${CLIENT_URL}/forget-password<br><br> Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`
                                // };
                                // transporter.sendMail(mailOptions, (err) => {
                                //     if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                                //     else return done(null, user, { status: 200, message: MSG_DESC[6] });
                                // });
                            }
                        })
                    }
                })
            }
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
                Token.find({ ipAddr: ip }, (err, data) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                    else if(data && data.length >= 5) return done(null, false, { status: 403, message: MSG_DESC[30] });
                    else if(!data || data.length < 5){
                        User.findOne({ email }, (err, user) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                            else if(!user) return done(null, false, { status: 400, message: MSG_DESC[32] });
                            else {
                                const id = user.id;
                                const token = crypto.randomBytes(120).toString("hex");
                                new Token({ ipAddr: ip, userId: encrypt(id), token: encrypt(token) }).save((err, data) => {
                                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                                    else {
                                        const mailOptions = {
                                            to: email,
                                            subject: '[TodoApp] Password Reset',
                                            html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--[if IE]><style type="text/css">a{text-decoration:none;color:black!important}</style><![endif]--> <!--[if (mso 16)]><style type="text/css">a{text-decoration:none}</style><![endif]--> <!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--> <!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--></head><body><div class="es-wrapper-color"> <!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f4f4f4"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/todo-application/v0.4.3/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Need to reset your password? No problem! Just click the button below to reset your password!</p><div style="display: block; width: 100%; text-align: center; margin: 30px 0;"> <a href="${CLIENT_URL}/reset-password/${id}-${data.id}/${token}" style="padding: 15px 30px; background-color: rgb(8 72 179); color: white; text-decoration: none; border-radius: 5px; font-family: Cambria, Georgia, Times, 'Times New Roman', serif; font-weight: bold;">Reset your password</a></div><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">This link will expires after one hour. To get a new password reset link, visit:<br>${CLIENT_URL}/forget-password</p><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Best Regards,<br>Stanley Owen</p></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because a password reset was requested for your account.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
                                        };
                                        transporter.sendMail(mailOptions, (err) => {
                                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                                            else return done(null, user, { status: 200, message: MSG_DESC[29] });
                                        });
                                    }
                                });
                            }
                        })
                    }
                })
            }else return done(null, false, { status: 400, message: MSG_DESC[33] })
        })
        .catch(() => { return done(null, false, { status: 400, message: MSG_DESC[33] }) })
    })
    .catch(() => { return done(null, false, { status: 500, message: MSG_DESC[0] }); })
}))

passport.use('resetPassword', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {id, token, confirmPassword} = req.body;
    if(!id || !token || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    else {
        const userId = id.split('-')[0];
        const todoId = id.split('-')[1];
        bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
            else {
                User.findOneAndUpdate({_id: userId, email}, { password: hash }, (err, user) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                    else if(!user) return done(null, false, { status: 401, message: MSG_DESC[10] });
                    else if(user) {
                        Token.findByIdAndDelete(todoId, (err, data) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                            else if(data && token === decrypt(data.token)){
                                const mailOptions = {
                                    to: email,
                                    replyTo: process.env.MAIL_REPLY_TO,
                                    subject: '[TodoApp] Password Changed',
                                    html: `Hi ${email},<br><br>We wanted to inform that your Todo Application password has changed.<br><br> If you did not perform this action, you can recover access by entering ${email} into the form at ${CLIENT_URL}/forget-password<br><br> Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`
                                };
                                transporter.sendMail(mailOptions, (err) => {
                                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                                    else return done(null, user, { status: 200, message: MSG_DESC[6] });
                                });
                            }
                            else return done(null, false, { status: 400, message: MSG_DESC[32] });
                        })
                    }
                })
            }
        })
    }
}))

passport.use('tokenData', new localStrategy({ usernameField: 'id', passwordField: 'token', session: false }, (id, token, done) => {
    const userId = id.split('-')[0];
    const tokenId = id.split('-')[1];
    Token.findById(tokenId, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(user && userId === decrypt(user.userId) && token === decrypt(user.token)){
            User.findById(userId, (err, user) => {
                if(err) done(null, false, { status: 500, message: MSG_DESC[0] });
                else if(!user) return done(null, false, { status: 400, message: MSG_DESC[31] });
                else if(user) return done(null, user, { status: 200, message: MSG_DESC[5] });
            })
        }
        else return done(null, false, { status: 400, message: MSG_DESC[31] });
    })
}))

passport.use('github', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: process.env.GITHUB_CALLBACK }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
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
            if(user.thirdParty.isThirdParty && user.thirdParty.github && !user.thirdParty.verified) return done(null, false, { status: 302, type: 'redirect', url: `/auth/github/${encodeURIComponent(email)}` })
            else if(user.thirdParty.isThirdParty && user.thirdParty.github && user.thirdParty.verified) return done(null, user)
            else return done(null, false, { status: 403, message: MSG_DESC[16] });
        }
    })
}))

passport.use('connectGitHub', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: `${process.env.GITHUB_CALLBACK}/connect` }, (accessToken, refreshToken, profile, done) => {
    User.findOne({email: profile._json.email, 'thirdParty.github': false}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) return done(null, false, { status: 403, message: MSG_DESC[16] });
        else if(user) return done(null, user)
    })
}))

passport.use('google', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: process.env.GOOGLE_CALLBACK }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
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
            if(user.thirdParty.isThirdParty && user.thirdParty.google && !user.thirdParty.verified) return done(null, false, { status: 302, type: 'redirect', url: `/auth/google/${encodeURIComponent(email)}` })
            else if(user.thirdParty.isThirdParty && user.thirdParty.google && user.thirdParty.verified) return done(null, user)
            else return done(null, false, { status: 403, message: MSG_DESC[16] });
        }
    })
}))

passport.use('connectGoogle', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: `${process.env.GOOGLE_CALLBACK}/connect` }, (accessToken, refreshToken, profile, done) => {
    const email = profile._json.email;
    User.findOne({email, 'thirdParty.google': false}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) return done(null, false, { status: 403, message: MSG_DESC[16] });
        else if(user) return done(null, user)
    })
}))

passport.use('getOAuthData', new localStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {provider} = req.params;
    if(!provider) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(provider === "google"){
        User.findOne({email, 'thirdParty.google': true, 'thirdParty.verified': false }, (err, user) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
            else if(!user) done(null, false, { status: 400, message: MSG_DESC[32] });
            else if(user) return done(null, user, { status: 200, message: true });
        })
    }else {
        User.findOne({email, 'thirdParty.github': true, 'thirdParty.verified': false }, (err, user) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
            else if(!user) done(null, false, { status: 400, message: MSG_DESC[32] });
            else if(user) return done(null, user, { status: 200, message: true });
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
            else if(provider === "google") {
                User.findOneAndUpdate({email, 'thirdParty.google': true, 'thirdParty.verified': false }, { password: hash, 'thirdParty.verified': true }, (err, user) => {
                    if(err) return done(err, false);
                    else if(!user) done(null, false, { status: 400, message: MSG_DESC[32] });
                    else if(user) return done(null, user, { status: 200, message: MSG_DESC[4]});
                })
            }else {
                User.findOneAndUpdate({email, 'thirdParty.github': true, 'thirdParty.verified': false }, { password: hash, 'thirdParty.verified': true }, (err, user) => {
                    if(err) return done(err, false);
                    else if(!user) done(null, false, { status: 400, message: MSG_DESC[32] });
                    else if(user) return done(null, user, { status: 200, message: MSG_DESC[4]});
                })
            }
        })
    }
}))

const extractJWT = (req) => {
    var token = null;
    if(req.cookies) token = req.cookies['jwt-token'];
    return token;
}

const opts = {
    jwtFromRequest: extractJWT,
    secretOrKey: jwtSecret,
    passReqToCallback: true
};

passport.use('jwt', new JWTStrategy(opts, (req, payload, done) => {
    User.findOne({ _id: payload.id, email: payload.email }, (err, user) => {
        if(err) return done(err, false);
        else if(user){
            BlacklistedToken.find({ userId: user._id }, (err, data) => {
                if(err) return done(err, false);
                else if(data){
                    for (x=0; x < data.length; x++){
                        if(decrypt(data[x].token) === req.cookies['jwt-token']) return done(null, false, { status: 403, message: MSG_DESC[15] });
                        else if(x === data.length-1 && decrypt(data[x].token) !== req.cookies['jwt-token']) return done(null, user, { status: 200, message: MSG_DESC[5] });
                    }
                }
                else if(!data) return done(null, user, { status: 200, message: MSG_DESC[5] });
            })
        }else return done(null, false, { status: 400, message: MSG_DESC[16] });
    })
}))

module.exports = passport;