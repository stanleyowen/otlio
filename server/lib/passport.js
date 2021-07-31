const bcrypt = require('bcrypt')
const crypto = require('crypto')
const passport = require('passport')
const ObjectId = require('mongoose').Types.ObjectId
const nodemailer = require('nodemailer')
const JWTStrategy = require('passport-jwt').Strategy
const localStrategy = require('passport-local').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const MSG_DESC = require('./callback')
const { encrypt, decrypt } = require('../lib/crypto')
let User = require('../models/users.model')
let Todo = require('../models/todo.model')
let Token = require('../models/token.model')
let OTPToken = require('../models/otp.model')
let RevokedToken = require('../models/revoke-token.model')

const SALT_WORK_FACTOR = 12
const jwtSecret = process.env.JWT_SECRET
const CLIENT_URL = process.env.CLIENT_URL
const listLabel = ["Priority","Secondary","Important","Do Later"]
const type = ["Question","Improvement","Security Issue/Bug","Account Management","Others"]
const isNum = /^\d+$/
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_EMAIL,
      pass: process.env.MAIL_PASSWORD
    }
})

const isObjId = (e) => {
    if(ObjectId.isValid(e) && (String)(new ObjectId(e)) === e) return true
    else return false
}

const validateTicketType = (e) => {
    for (a=0; a<type.length; a++){
        if(e === type[a]) return false
        else if(a === type.length-1 && e !== type[a]) return true
    }
}

const validateLabel = (e) => {
    for (a=0; a<listLabel.length; a++){
        if(e === listLabel[a].toLowerCase()) return false
        else if(a === listLabel.length-1 && e !== listLabel[a].toLowerCase()) return true
    }
}

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

passport.use('register', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {confirmPassword} = req.body
    if(!confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] })
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 60 || confirmPassword.length < 6 || confirmPassword.length > 60) return done(null, false, { status: 400, message: MSG_DESC[9] })
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false)
        else if(user) return done(null, false, { status: 400, message: MSG_DESC[1] })
        else if(!user)
            bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
                if(err) return done(err, false)
                new User ({ email, password: hash }).save((err, data) => {
                    if(err) return done(err, false)
                    return done(null, {...data._doc, _id: String(data._id)}, { status: 200, message: MSG_DESC[4] })
                })
            })
    })
}))

passport.use('login', new localStrategy({ usernameField: 'email', passwordField: 'password', session: false }, (email, password, done) =>
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 400, message: MSG_DESC[10] })
        else if(user)
            bcrypt.compare(password, user.password, (err, match) => {
                if(err) return done(err, false)
                else if(!match) return done(null, false, { status: 400, message: MSG_DESC[10] })
                else if(match) return done(null, user, { status: user.security['2FA'] ? 302 : 200, message: MSG_DESC[2] })
            })
    })
))

passport.use('changePassword', new localStrategy({ usernameField: 'email', passwordField: 'oldPassword', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {_id, newPassword, confirmPassword} = req.body
    if(!_id || !newPassword || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] })
    else if(!isObjId(_id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 60 || newPassword.length < 6 || newPassword.length > 60 || confirmPassword.length < 6 || confirmPassword.length > 60) return done(null, false, { status: 400, message: MSG_DESC[9] })
    else if(newPassword !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    User.findOne({_id, email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 401, message: MSG_DESC[10] })
        else if(user)
            bcrypt.compare(password, user.password, (err, match) => {
                if(err) return done(err, false)
                else if(!match) return done(null, false, { status: 401, message: MSG_DESC[10] })
                else if(match)
                    bcrypt.hash(newPassword, SALT_WORK_FACTOR, (err, hash) => {
                        if(err) return done(err, false)
                        new RevokedToken ({ userId: _id, token: encrypt(req.cookies['jwt-token'], 1) }).save(err => {
                            if(err) return done(err, false)
                            user.password = hash;
                            user.save(err => {
                                if(err) return done(err, false)
                                const mailOptions = {
                                    to: email,
                                    subject: '[Otlio] Password Changed',
                                    html: `Hi ${email},<br><br>We wanted to inform that your Otlio password has changed.<br><br> If you did not perform this action, you can recover access by entering ${email} into the form at ${CLIENT_URL}/reset-password<br><br>If you run into problems, please email us at otlio.cs@gmail.com<br><br>Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`
                                }
                                transporter.sendMail(mailOptions, err => {
                                    if(err) return done(err, false)
                                    return done(null, user, { status: 200, message: MSG_DESC[6] })
                                })
                            })
                        })
                    })
            })
    })
}))

passport.use('tokenData', new localStrategy({ usernameField: 'id', passwordField: 'token', passReqToCallback: true, session: false }, (req, id, token, done) => {
    const {type} = req.params
    const userId = id.split('-')[0].toLowerCase()
    const tokenId = id.split('-')[1].toLowerCase()
    if(!type || !userId || !tokenId) return done(null, false, { status: 400, message: MSG_DESC[11] })
    else if(!isObjId(userId) || !isObjId(tokenId)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    var query = {}; query['_id'] = tokenId; query['type.'.concat(type)] = true
    Token.findOne(query, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 400, message: MSG_DESC[31] })
        else if(user && userId === decrypt(user.userId, 3) && token === decrypt(user.token, 3))
            User.findById(userId, (err, user) => {
                if(err) return done(err, false)
                else if(!user) return done(null, false, { status: 400, message: MSG_DESC[31] })
                else if(user)
                    return done(null, true, {
                        status: 200,
                        message: MSG_DESC[5],
                        credentials: {
                            id: user.id,
                            email: user.email
                        }
                    })
            })
    })
}))

passport.use('forgotPassword', new localStrategy({ usernameField: 'email', passwordField: 'email', session: false }, (email, token, done) => {
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 400, message: MSG_DESC[32] })
        else if(user) {
            const id = user.id; const token = crypto.randomBytes(60).toString("hex").toUpperCase()
            new Token ({ 'type.passwordReset': true, userId: encrypt(id, 3), token: encrypt(token, 3) }).save((err, data) => {
                if(err) return done(err, false)
                const mailOptions = {
                    to: email,
                    subject: '[Otlio] Password Reset',
                    html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--[if IE]><style type="text/css">a{text-decoration:none;color:black!important}</style><![endif]--> <!--[if (mso 16)]><style type="text/css">a{text-decoration:none}</style><![endif]--> <!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--> <!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--></head><body><div class="es-wrapper-color"> <!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f4f4f4"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/otlio/master/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Need to reset your password? No problem! Just click the button below to reset your password!</p><div style="display: block; width: 100%; text-align: center; margin: 30px 0;"> <a href="${CLIENT_URL}/reset-password/${String(id).toUpperCase()}-${String(data.id).toUpperCase()}/${token}" style="padding: 15px 30px; background-color: rgb(8 72 179); color: white; text-decoration: none; border-radius: 5px; font-family: Cambria, Georgia, Times, 'Times New Roman', serif; font-weight: bold;">Reset your password</a></div><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">This link will expires after one hour. To get a new password reset link, visit:<br>${CLIENT_URL}/reset-password</p><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Best Regards,<br>Otlio</p></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because a password reset was requested for your account.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
                }
                transporter.sendMail(mailOptions, err => {
                    if(err) return done(err, false)
                    return done(null, true, { status: 200, message: MSG_DESC[29] })
                })
            })
        }
    })
}))

passport.use('token', new localStrategy({ usernameField: 'id', passwordField: 'token', passReqToCallback: true, session: false }, (req, id, token, done) => {
    const {type, email, password, confirmPassword} = req.body
    const userId = id.split('-')[0].toLowerCase()
    const tokenId = id.split('-')[1].toLowerCase()
    if(!type || !userId || !tokenId) return done(null, false, { status: 400, message: MSG_DESC[11] })
    else if(!isObjId(userId) || !isObjId(tokenId)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    else if(type === 'passwordReset') {
        if(!email || !password || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] })
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, { status: 400, message: MSG_DESC[8] })
        else if(password.length < 6 || password.length > 60 || confirmPassword.length < 6 || confirmPassword.length > 60) return done(null, false, { status: 400, message: MSG_DESC[9] })
        else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    }
    var query = {}; query['_id'] = tokenId; query['type.'.concat(type)] = true;
    Token.findOne(query, async (err, data) => {
        if(err) return done(err, false)
        else if(!data) return done(null, false, { status: 400, message: MSG_DESC[16] })
        else if(data && userId === decrypt(data.userId, 3) && token === decrypt(data.token, 3)){
            var query = {}; query['_id'] = userId; email ? query['email'] = email : null;
            var updateData = {}
            if(type === 'passwordReset') updateData['password'] = await bcrypt.hash(password, SALT_WORK_FACTOR)
            else updateData['verified'] = true
            User.findOneAndUpdate(query, updateData, (err, user) => {
                if(err) return done(err, false)
                else if(!user) return done(null, false, { status: 401, message: MSG_DESC[10] })
                else if(user) {
                    data.deleteOne(err => {
                        if(err) return done(err, false)
                        if(type === 'passwordReset') {
                            const mailOptions = {
                                to: email,
                                subject: '[Otlio] Password Changed',
                                html: `Hi ${email},<br><br>We wanted to inform that your Otlio password has changed.<br><br> If you did not perform this action, you can recover access by entering ${email} into the form at ${CLIENT_URL}/reset-password<br><br> Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`
                            }
                            transporter.sendMail(mailOptions, err => {
                                if(err) return done(err, false)
                                return done(null, user, { status: 200, message: MSG_DESC[6] })
                            })
                        }else return done(null, user, { status: 200, message: MSG_DESC[47] })
                    })
                }
            })
        }
    })
}))

passport.use('verifyAccount', new localStrategy({ usernameField: 'email', passwordField: '_id', session: false }, (email, _id, done) => {
    if(!isObjId(_id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    User.findOne({ _id, email, verified: false }, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 400, message: MSG_DESC[16] })
        else if(user) {
            const token = crypto.randomBytes(50).toString("hex").toUpperCase()
            new Token({ 'type.accountVerification': true, userId: encrypt(_id, 3), token: encrypt(token, 3) }).save((err, data) => {
                if(err) return done(err, false)
                const mailOptions = {
                    to: email,
                    subject: '[Otlio] Account Verification',
                    html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--[if (mso 16)]><style type="text/css">a{text-decoration:none;}</style><![endif]--><!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--><!--[if gte mso 9]> <xml><o:OfficeDocumentSettings><o:AllowPNG></o:AllowPNG><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--></head><body><div class="es-wrapper-color"><!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"><v:fill type="tile" color="#f4f4f4"></v:fill></v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/otlio/master/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-align: center;">Verify Email</h2><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Thanks for creating account in Otlio. You're almost done - we just need to verify your email.</p><div style="display: block; width: 100%; text-align: center; margin: 30px 0;"><a href="${CLIENT_URL}/verify/${String(_id).toUpperCase()}-${String(data.id).toUpperCase()}/${token}" style="padding: 15px 30px; background-color: rgb(8 72 179); color: white; text-decoration: none; border-radius: 5px; font-family: Cambria, Georgia, Times, 'Times New Roman', serif; font-weight: bold;">Verify Email</a></div><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">This link will expires after one hour. To get a account verification link, please request it through Account Settings.</p><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Best Regards,<br>Otlio</p></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because your email was provided for registration on Otlio.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
                }
                transporter.sendMail(mailOptions, (err) => {
                    if(err) return done(err, false)
                    return done(null, user, { status: 200, message: MSG_DESC[35] })
                })
            })
        }
    })
}))

passport.use('github', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: process.env.GITHUB_CALLBACK, scope: 'user:email' }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user)
            new User ({
                email,
                password: null,
                thirdParty: {
                    github: true,
                    isThirdParty: true
                }
            }).save(err => {
                if(err) return done(err, false)
                return done(null, false, { status: 302, type: 'redirect', url: `/auth/github/${encodeURIComponent(email)}` })
            })
        else if(user) {
            if(user.thirdParty.isThirdParty && user.thirdParty.github && !user.thirdParty.verified) return done(null, false, { status: 302, type: 'redirect', url: `/auth/github/${encodeURIComponent(email)}` })
            else if(user.thirdParty.isThirdParty && user.thirdParty.github && user.thirdParty.verified) return done(null, user, { status: user.security['2FA'] ? 302 : 200, message: MSG_DESC[5] })
            else return done(null, false, { status: 403, message: MSG_DESC[16] })
        }
    })
}))

passport.use('connectGitHub', new GitHubStrategy ({ clientID: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET, callbackURL: `${process.env.GITHUB_CALLBACK}/connect`, passReqToCallback: true }, (req, accessToken, refreshToken, profile, done) => {
    const {_id, email} = req.body
    if(profile._json.email !== email) return done(null, false, { status: 403, message: MSG_DESC[48] })
    else if(!isObjId(_id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    User.findOne({_id, email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 403, message: MSG_DESC[27] })
        else if(user) {
            user.thirdParty.github = !user.thirdParty.github
            user.thirdParty.isThirdParty = user.thirdParty.github ? true : user.thirdParty.google ? true : false
            user.thirdParty.verified = user.thirdParty.github ? true : user.thirdParty.google ? true : false
            user.save(err => {
                if(err) return done(err, false)
                return done(null, user, { status: 200, message: MSG_DESC[user.thirdParty.github ? 26 : 46] })
            })
        }
    })
}))

passport.use('google', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: process.env.GOOGLE_CALLBACK }, (accessToken, refreshToken, profile, done) => {
    const {email} = profile._json
    User.findOne({email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user)
            new User ({
                email,
                password: null,
                thirdParty: {
                    google: true,
                    isThirdParty: true
                }
            }).save(err => {
                if(err) return done(err, false)
                return done(null, false, { status: 302, type: 'redirect', url: `/auth/google/${encodeURIComponent(email)}` })
            })
        else if(user) {
            if(user.thirdParty.isThirdParty && user.thirdParty.google && !user.thirdParty.verified) return done(null, false, { status: 302, type: 'redirect', url: `/auth/google/${encodeURIComponent(email)}` })
            else if(user.thirdParty.isThirdParty && user.thirdParty.google && user.thirdParty.verified) return done(null, user, { status: user.security['2FA'] ? 302 : 200, message: MSG_DESC[5] })
            return done(null, false, { status: 403, message: MSG_DESC[16] })
        }
    })
}))

passport.use('connectGoogle', new GoogleStrategy ({ clientID: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET, callbackURL: `${process.env.GOOGLE_CALLBACK}/connect`, passReqToCallback: true }, (req, accessToken, refreshToken, profile, done) => {
    const {_id, email} = req.body
    if(profile._json.email !== email) return done(null, false, { status: 403, message: MSG_DESC[48] })
    else if(!isObjId(_id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    User.findOne({_id, email: profile._json.email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 403, message: MSG_DESC[25] })
        user.thirdParty.google = !user.thirdParty.google
        user.thirdParty.isThirdParty = user.thirdParty.google ? true : user.thirdParty.github ? true : false
        user.thirdParty.verified = user.thirdParty.google ? true : user.thirdParty.github ? true : false
        user.save(err => {
            if(err) return done(err, false)
            return done(null, user, { status: 200, message: MSG_DESC[user.thirdParty.google ? 24 : 45] })
        })
    })
}))

passport.use('getOAuthData', new localStrategy({ usernameField: 'email', passwordField: 'provider', session: false }, (email, provider, done) => {
    if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, { status: 400, message: MSG_DESC[8] })
    var query = {}
    query['email'] = email; query['thirdParty.'.concat(provider)] = true; query['thirdParty.verified'] = false
    User.findOne(query, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 401, message: MSG_DESC[10] })
        else return done(null, user, { status: 200, message: MSG_DESC[5] })
    })
}))

passport.use('registerOAuth', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {provider, confirmPassword} = req.body
    if(!provider || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[3] })
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 60 || confirmPassword.length < 6 || confirmPassword.length > 60) return done(null, false, { status: 400, message: MSG_DESC[9] })
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
        if(err) return done(err, false)
        var query = {}; query['email'] = email; query['thirdParty.'.concat(provider)] = true; query['thirdParty.verified'] = false;
        User.findOneAndUpdate(query, { password: hash, verified: true, 'thirdParty.verified': true }, (err, user) => {
            if(err) return done(err, false)
            else if(!user) return done(null, false, { status: 401, message: MSG_DESC[10] })
            else if(user) return done(null, user, { status: 200, message: MSG_DESC[4] })
        })
    })
}))

passport.use('sendOTP', new localStrategy({ usernameField: 'email', passwordField: '_id', session: false }, (email, id, done) => {
    if(!isObjId(id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    User.findOne({ _id: id, email }, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 400, message: MSG_DESC[32] })
        const token = crypto.randomInt(Math.pow(10, 6-1), Math.pow(10, 6)).toString()
        new OTPToken ({ userId: encrypt(id, 2), token: encrypt(token, 2) }).save((err, data) => {
            if(err) return done(err, false)
            const mailOptions = {
                to: email,
                subject: '[Otlio] One Time Password',
                html: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"> <!--[if IE]><style type="text/css">a{text-decoration:none;color:black!important}</style><![endif]--> <!--[if (mso 16)]><style type="text/css">a{text-decoration:none}</style><![endif]--> <!--[if gte mso 9]><style>sup{font-size:100% !important}</style><![endif]--> <!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> <![endif]--></head><body><div class="es-wrapper-color"> <!--[if gte mso 9]> <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f4f4f4"></v:fill> </v:background> <![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-email-paddings" valign="top"><table class="es-header" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" esd-custom-block-id="6339" style="background-color: rgb(8 72 179); padding: 10px; border-radius: 10px;" bgcolor="#7c72dc" align="center"><table class="es-header-body" width="600" cellspacing="0" cellpadding="0" align="center"><tr><table width="100%" cellspacing="0" cellpadding="0"><tr><td class="esd-block-image es-p25t es-p25b es-p10r es-p10l" align="center" style="font-size: 0px;"><img src="https://raw.githubusercontent.com/stanleyowen/otlio/master/client/public/logo512.png" alt style="display: block;" width="40"></td></tr></table></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center"><tr><td class="esd-stripe" align="center"><table class="es-content-body" style="background-color: #ffffff;" width="600" cellspacing="0" cellpadding="10" bgcolor="#ffffff" align="center"><tr><td bgcolor="#ffffff" align="left"><h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-align: center;">One Time Password</h2><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif">Your One Time Password (OTP):</p><h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; text-align: center;">${token}</h2></td></tr><tr><td align="center"><p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: gray; font-size: 15px;">You're receiving this email because Two Factor Authentication is enabled.</p></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
            }
            transporter.sendMail(mailOptions, (err) => {
                if(err) return done(err, false)
                return done(null, { email: user.email, userId: user.id, tokenId: data.id }, { status: 200, message: MSG_DESC[36] })
            })
        })
    })
}))

passport.use('verifyOTP', new localStrategy({ usernameField: 'email', passwordField: '_id', passReqToCallback: true, session: false }, (req, email, _id, done) => {
    const {tokenId, token, isBackupCode} = req.body
    const data = req.body
    if(!token || (!isBackupCode && !tokenId)) return done(null, false, { status: 400, message: MSG_DESC[37] })
    else if(tokenId && !isObjId(tokenId)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    else if(token && !isNum.test(token)) return done(null, false, { status: 400, message: MSG_DESC[53] })
    else if(isBackupCode && token)
        User.findOne({_id, email}, (err, user) => {
            if(err) return done(err, false)
            else if(!user) return done(null, false, { status: 400, message: MSG_DESC[44] })
            else if(user) {
                const valid = user.security['backup-codes'].valid.map(a => { return decrypt(a, 4) })
                for (a=0; a<valid.length; a++){
                    if(token === valid[a]) {
                        user.security['backup-codes'].invalid = [...user.security['backup-codes'].invalid, user.security['backup-codes'].valid[a]]
                        user.security['backup-codes'].valid.splice(a, 1)
                        user.save()
                        return done(null, data, { status: 200, message: MSG_DESC[5] })
                    }else if(a === valid.length-1 && token !== valid[a]) return done(null, false, { status: 400, message: MSG_DESC[44] })
                }
            }
        })
    else
        OTPToken.findById(tokenId, (err, data) => {
            if(err) return done(err, false)
            else if(!data || _id != decrypt(data.userId, 2) || token !== decrypt(data.token, 2)) return done(null, false, { status: 400, message: MSG_DESC[38] })
            else if(data)
                data.deleteOne(err => {
                    if(err) return done(err, false)
                    return done(null, req.body, { status: 200, message: MSG_DESC[5] })
                })
        })
}))

passport.use('generateToken', new localStrategy({ usernameField: 'email', passwordField: '_id', passReqToCallback: true, session: false } , (req, email, _id, done) => {
    const {regenerate} = req.body
    if(!isObjId(_id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    User.findOne({_id, email}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 400, message: MSG_DESC[16] })
        else if(user) {
            if(regenerate || !user.security['2FA']){
                let backupCodes = [];
                for (let x=0; x<10; x++) backupCodes.push(encrypt((crypto.randomInt(Math.pow(10, 8-1), Math.pow(10, 8)).toString()), 4))
                user.security['backup-codes'].valid = backupCodes
                user.security['backup-codes'].invalid = []
                user.save()
                const decryptedToken = backupCodes.map(a => { return decrypt(a, 4) })
                return done(null, true, { status: 200, message: MSG_DESC[42], 'backup-codes': decryptedToken })
            }
            user.security['backup-codes'].valid = []
            user.security['backup-codes'].invalid = []
            user.save()
            return done(null, user, { status: 200, message: MSG_DESC[43] })
        }
    })
}))

passport.use('supportTicket', new localStrategy({ usernameField: 'email', passwordField: 'type', passReqToCallback: true, session: false }, (req, email, type, done) => {
    const {subject, description} = req.body
    if(!subject || !description) return done(null, false, {status: 400, message: MSG_DESC[11]})
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(subject.length < 15 || subject.length > 50) return done(null, false, {status: 400, message: MSG_DESC[50]})
    else if(validateTicketType(type)) return done(null, false, {status: 400, message: MSG_DESC[49]})
    else if(description.length > 5000) return done(null, false, {status: 400, message: MSG_DESC[50]})
    const mailOptions = {
        to: process.env.MAIL_SUPPORT,
        replyTo: email,
        subject: `[Otlio] ${subject}`,
        text: `Email Address: ${email}\nTicket Type: ${type}\nSubject: ${subject}\nDescription:\n${description}`
    }
    transporter.sendMail(mailOptions, err => {
        if(err) return done(err, false)
        return done(null, true, { status: 200, message: MSG_DESC[51] })
    })
}))

passport.use('todoData', new localStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallback: true, session: false }, (req, email, id, done) => {
    if(req.query.id && !isObjId(req.query.id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    else if(req.query.id)
        Todo.findOne({_id: req.query.id, email}, (err, data) => {
            if(err) return done(err, false)
            else if(!data) return done(err, null, {status: 404, message: MSG_DESC[13]})
            return done(null, {
                _id: data.id,
                email: data.email,
                title: decrypt(data.title, 1),
                label: decrypt(data.label, 1),
                description: data.description.data ? decrypt(data.description, 1) : '',
                date: decrypt(data.date, 1)
            })
        })
    else
        Todo.find({email}, (err, data) => {
            if(err) return done(err, false)
            let todoData = []
            data.map(a =>
                todoData.push({
                    _id: String(a._id),
                    email: a.email,
                    title: decrypt(a.title, 1),
                    label: decrypt(a.label, 1),
                    description: a.description.data ? decrypt(a.description, 1) : '',
                    date: decrypt(a.date, 1),
                    index: a.index
                })
            )
            return done(null, todoData.sort((a, b) => { return a.index - b.index }))
        })
}))

passport.use('addTodo', new localStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallback: true, session: false }, (req, email, id, done) => {
    const {title, label, description, date} = req.body
    if(!title || !label || !date) return done(null, false, {status: 400, message: MSG_DESC[11]})
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, {status: 400, message: MSG_DESC[8]})
    else if(title.length > 60) return done(null, false, {status: 400, message: MSG_DESC[17]})
    else if(validateLabel(label)) return done(null, false, {status: 400, message: MSG_DESC[18]})
    else if(description && description.length > 200) return done(null, false, {status: 400, message: MSG_DESC[19]})
    new Todo ({
        email,
        title: encrypt(title, 1),
        label: encrypt(label, 1),
        description: description ? encrypt(description, 1) : {data: '', iv: ''},
        date: encrypt(date, 1)
    }).save((err) => {
        if(err) return done(err, false)
        return done(null, true, { status: 200, message: MSG_DESC[23] })
    })
}))

passport.use('updateTodo', new localStrategy({ usernameField: 'email', passwordField: '_id', passReqToCallback: true, session: false }, (req, email, _id, done) => {
    const {title, label, description, date} = req.body
    if(!title || !label || !date) return done(null, false, {status: 400, message: MSG_DESC[11]})
    else if(!isObjId(_id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, {status: 400, message: MSG_DESC[8]})
    else if(title.length > 60) return done(null, false, {status: 400, message: MSG_DESC[17]})
    else if(validateLabel(label)) return done(null, false, {status: 400, message: MSG_DESC[18]})
    else if(description && description.length > 200) return done(null, false, {status: 400, message: MSG_DESC[19]})
    Todo.findOneAndUpdate({_id, email}, {
        title: encrypt(title, 1),
        label: encrypt(label, 1),
        description: description ? encrypt(description, 1) : {data: '', iv: ''},
        date: encrypt(date, 1)
    }, (err) => {
        if(err) return done(err, false)
        return done(null, true, { status: 200, message: MSG_DESC[21] })
    })
}))

passport.use('updateIndex', new localStrategy({ usernameField: 'email', passwordField: '_id', passReqToCallback: true, session: false }, (req, email, _id, done) => {
    const {data} = req.body
    if(!data) return done(null, false, {status: 400, message: MSG_DESC[11]})
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 60) return done(null, false, {status: 400, message: MSG_DESC[8]})
    data.map(a => {
        if(!isObjId(a._id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
        Todo.findOneAndUpdate({_id: a._id, email}, { index: a.index }, (err) => {
            if(err) return done(err, false)
        })
    })
    return done(null, true, { status: 200, message: MSG_DESC[21] })
}))

passport.use('deleteTodo', new localStrategy({ usernameField: 'email', passwordField: 'objId', session: false }, (email, _id, done) => {
    if(!isObjId(_id)) return done(null, false, { status: 400, message: MSG_DESC[52] })
    Todo.findOneAndDelete({_id, email}, (err, data) => {
        if(err) return done(err, false)
        else if(!data) return done(null, false, { status: 403, message: MSG_DESC[16] })
        else if(data) return done(null, data, { status: 200, message: MSG_DESC[22] })
    })
}))

const opts = {
    jwtFromRequest: req => req.cookies['jwt-token'],
    secretOrKey: jwtSecret,
    passReqToCallback: true
}

passport.use('jwt', new JWTStrategy(opts, (req, payload, done) =>
    User.findOne({_id: payload.id, email: payload.email, 'security.2FA': payload.auth['2FA']}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, {status: 401, message: MSG_DESC[16]})
        else {
            if(user.security['2FA'] === payload.auth.status && user.verified)
                RevokedToken.find({userId: user.id}, (err, data) => {
                    if(err) return done(err, false)
                    else if(data.length){
                        for (x=0; data.length; x++){
                            if(decrypt(data[x].token, 1) === req.cookies['jwt-token']) return done(null, false, { status: 403, message: MSG_DESC[15] })
                            else if(x === data.length-1 && decrypt(data[x].token, 1) !== req.cookies['jwt-token']) return done(null, {...user._doc, _id: String(user._doc._id)})
                        }
                    }else if(!data.length) return done(null, {...user._doc, _id: String(user._doc._id)})
                })
            else if(user.security['2FA'] !== payload.auth.status)
                return done(null, {id: String(user._id), email: user.email}, {
                    status: 302,
                    message: MSG_DESC[37],
                    type: { mfa: true, verifyAccount: false }
                })
            else if(!user.verified)
                return done(null, {id: String(user._id), email: user.email}, {
                    status: 302,
                    message: MSG_DESC[37],
                    type: { mfa: false, verifyAccount: true }
                })
        }
    })
))

passport.use('jwtOTP', new JWTStrategy(opts, (req, payload, done) =>
    User.findOne({_id: payload.id, email: payload.email, 'security.2FA': payload.auth['2FA']}, (err, user) => {
        if(err) return done(err, false)
        else if(!user) return done(null, false, { status: 401, message: MSG_DESC[16] })
        else if(user)
            RevokedToken.find({ userId: user.id }, (err, data) => {
                if(err) return done(err, false)
                else if(data.length){
                    for (x=0; data.length; x++){
                        if(decrypt(data[x].token, 1) === req.cookies['jwt-token']) return done(null, false, { status: 403, message: MSG_DESC[15] })
                        else if(x === data.length-1 && decrypt(data[x].token, 1) !== req.cookies['jwt-token']) return done(null, {...user._doc, _id: String(user._doc._id)})
                    }
                }else if(!data.length) return done(null, {...user._doc, _id: String(user._doc._id)})
            })
    })
))

module.exports = passport