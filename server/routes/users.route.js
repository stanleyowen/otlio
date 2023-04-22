const jwt = require('jsonwebtoken')
const passport = require('passport')
const router = require('express').Router()
const rateLimit = require('express-rate-limit')

const MSG_DESC = require('../lib/callback')
const { encrypt, decrypt } = require('../lib/crypto')
let User = require('../models/users.model')
let RevokedToken = require('../models/revoke-token.model')

const jwtSecret = process.env.JWT_SECRET
const status = process.env.NODE_ENV === 'production'

const OTPLimiter = new rateLimit({
    max: 20,
    windowMs: 3600000,
    skipFailedRequests: true,
    handler: (req, res) => res.status(429).send(JSON.stringify({status: 429, message: MSG_DESC[41]}, null, 2))
})
const Limiter = new rateLimit({
    max: 10,
    windowMs: 86400000, // 1 day
    skipFailedRequests: true,
    handler: (req, res) => res.status(429).send(JSON.stringify({status: 429, message: MSG_DESC[30]}, null, 2))
})
router.post('/register', Limiter, async (req, res, next) =>
    passport.authenticate('register', (err, user, infos) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(infos && (infos.status ? infos.status >= 300 ? true : false : true)) return res.status(infos.status ? infos.status : infos.status = 400).send(JSON.stringify(infos, null, 2))
        else if(user && (req.body = user))
            passport.authenticate('verifyAccount', { session: false }, (err, user, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(user)
                    return res.cookie('jwt-token', jwt.sign({
                        id: user._id,
                        email: user.email,
                        auth: {
                            '2FA': user.security['2FA'],
                            status: false
                        }
                    }, jwtSecret, { expiresIn: '1d' }), {
                        path: '/',
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: status,
                        sameSite: status ? 'none' : 'strict'
                    }).status(infos.status).send(JSON.stringify(infos, null, 2))
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.post('/login', new rateLimit({
    max: 10,
    windowMs: 1800000, // 30 minutes
    skipSuccessfulRequests: true,
    handler: (req, res) => res.status(429).send(JSON.stringify({status: 429, message: MSG_DESC[30]}, null, 2))
}) , async (req, res, next) =>
    passport.authenticate('login', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user)
            return res.cookie('jwt-token', jwt.sign({
                id: user._id,
                email: user.email,
                auth: {
                    '2FA': user.security['2FA'],
                    status: false
                }
            }, jwtSecret, { expiresIn: '1d' }), {
                path: '/',
                expires: JSON.parse(req.body.rememberMe ? req.body.rememberMe : true) ? new Date(Date.now() + 86400000) : false,
                httpOnly: true,
                secure: status,
                sameSite: status ? 'none' : 'strict'
            }).status(info.status).send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.get('/user', async (req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0], 'XSRF-TOKEN': req.csrfToken()}, null, 2))
        else if(info && info.status === 302) return res.status(info.status).send(JSON.stringify({...info, credentials: user, 'XSRF-TOKEN': req.csrfToken()}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({...info, 'XSRF-TOKEN': req.csrfToken()}, null, 2))
        else if(user) {
            user.security['backup-codes'].valid = user.security['backup-codes'].valid.map(a => { return(decrypt(a, 4)) })
            user.security['backup-codes'].invalid = user.security['backup-codes'].invalid.map(a => { return(decrypt(a, 4)) })
            return res.send(JSON.stringify({
                status: 200,
                message: MSG_DESC[5],
                credentials: {
                    id: user.id,
                    email: user.email,
                    authenticated: true,
                    thirdParty: user.thirdParty,
                    verified: user.verified,
                    security: user.security,
                }, 'XSRF-TOKEN': req.csrfToken()
            }, null, 2))
        }else return res.status(504).send(JSON.stringify({ status: 504, message: MSG_DESC[34], 'XSRF-TOKEN': req.csrfToken() }, null, 2))
    })(req, res, next)
)

router.put('/user', async (req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user) {
            async function sendCookie(user, info) {
                return res.cookie('jwt-token', jwt.sign({
                    id: user._id,
                    email: user.email,
                    auth: {
                        '2FA': user.security['2FA'],
                        status: user.security['2FA']
                    }
                }, jwtSecret, { expiresIn: '1d' }), {
                    path: '/',
                    maxAge: 86400000,
                    httpOnly: true,
                    secure: status,
                    sameSite: status ? 'none' : 'strict'
                }).status(info.status).send(JSON.stringify(info, null, 2))
            }
            if(user.security['2FA'] && (req.body = {...req.body, ...user}))
                passport.authenticate('verifyOTP', { session: false }, (err, user, info) => {
                    if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                    else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                    else if(user)
                        passport.authenticate('changePassword', { session: false }, (err, user, info) => {
                            if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                            else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                            else if(user) return sendCookie(user, info)
                            else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
                        })(req, res, next)
                    else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
                })(req, res, next)
            else if(user && (req.body = {...req.body, ...user}))
                passport.authenticate('changePassword', { session: false }, (err, user, info) => {
                    if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                    else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                    else if(user) return sendCookie(user, info)
                    else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
                })(req, res, next)
            else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
        }else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.get('/forgot-password', async (req, res, next) => {
    req.params = req.query
    passport.authenticate('tokenData', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user) return res.send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
})

router.post('/forgot-password', Limiter, async (req, res, next) =>
    passport.authenticate('forgotPassword', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user) return res.send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.post('/reset-password', async (req, res, next) =>
    passport.authenticate('token', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user)
            return res.cookie('jwt-token', jwt.sign({
                id: user._id,
                email: user.email,
                auth: {
                    '2FA': user.security['2FA'],
                    status: false
                }
            }, jwtSecret, { expiresIn: '1d' }), {
                path: '/',
                maxAge: 86400000,
                httpOnly: true,
                secure: status,
                sameSite: status ? 'none' : 'strict'
            }).status(info.status).send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.get('/verify', async (req, res, next) => {
    req.body = req.query
    passport.authenticate('token', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user) return res.send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
})

router.post('/verify', OTPLimiter, async (req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && info.status === 302 && (req.body = {...user, _id: user.id})){
            passport.authenticate('verifyAccount', { session: false }, (err, user, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(user) return res.send(JSON.stringify(info, null, 2))
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        } else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.get('/otp', OTPLimiter, async (req, res, next) =>
    passport.authenticate('jwtOTP', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user && (req.body = user)) {
            if(!user.verified) return res.status(403).send(JSON.stringify({status: 403, message: MSG_DESC[37]}, null, 2))
            passport.authenticate('sendOTP', { session: false }, (err, user, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(user) return res.status(200).send(JSON.stringify({...info, credentials: user}, null, 2))
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        }else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.post('/otp', async (req, res, next) =>
    passport.authenticate('jwtOTP', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user && (req.body = {...req.body, ...user})) {
            if(!user.verified) return res.status(403).send(JSON.stringify({status: 403, message: MSG_DESC[37]}, null, 2))
            passport.authenticate('verifyOTP', { session: false }, (err, user, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(user)
                    return res.cookie('jwt-token', jwt.sign({
                        id: user._id,
                        email: user.email,
                        auth: {
                            '2FA': user.security['2FA'],
                            status: true
                        }
                    }, jwtSecret, { expiresIn: '1d' }), {
                        path: '/',
                        expires: JSON.parse(req.body.rememberMe ? req.body.rememberMe : true) ? new Date(Date.now() + 86400000) : false,
                        httpOnly: true,
                        secure: status,
                        sameSite: status ? 'none' : 'strict'
                    }).send(JSON.stringify(info, null, 2))
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        }else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.put('/otp', async (req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user && (req.body = {...req.body, ...user}))
            passport.authenticate('verifyOTP', { session: false }, (err, user, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(user)
                    User.findById(user._id, (err, data) => {
                        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                        else if(data)
                            passport.authenticate('generateToken', { session: false }, (err, token, info) => {
                                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                                else if(token) {
                                    data.security['2FA'] = !data.security['2FA']
                                    data.save(err => {
                                        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                                        return res.cookie('jwt-token', jwt.sign({
                                            id: user._id,
                                            email: user.email,
                                            auth: {
                                                '2FA': !user.security['2FA'],
                                                status: !user.security['2FA']
                                            }
                                        }, jwtSecret, { expiresIn: '1d' }), {
                                            path: '/',
                                            maxAge: 86400000,
                                            httpOnly: true,
                                            secure: status,
                                            sameSite: status ? 'none' : 'strict'
                                        }).send(JSON.stringify(info, null, 2))  
                                    })
                                } else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
                            })(req, res, next)
                        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
                    })
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.post('/backup-code', Limiter, async (req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user && (req.body = {...req.body, ...user}))
            passport.authenticate('generateToken', { session: false }, (err, token, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(token) return res.status(info.status).send(JSON.stringify(info, null, 2))
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.post('/support', async (req, res, next) =>
    passport.authenticate('supportTicket', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user) return res.status(info.status).send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.post('/logout', async (req, res, next) =>
    passport.authenticate('jwtOTP', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user)
            new RevokedToken ({ userId: user._id, token: encrypt(req.cookies['jwt-token'], 1) }).save(err => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                return res.cookie('jwt-token', '', {
                    path: '/',
                    maxAge: 0,
                    httpOnly: true,
                    secure: status,
                    sameSite: status ? 'none' : 'strict'
                }).send(JSON.stringify({ status: 200, message: MSG_DESC[3] }, null, 2))
            })
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

module.exports = router