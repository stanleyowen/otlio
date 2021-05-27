const jwt = require('jsonwebtoken')
const passport = require('passport')
const router = require('express').Router()

const MSG_DESC = require('../lib/callback')

const jwtSecret = process.env.JWT_SECRET
const status = process.env.NODE_ENV === 'production'

router.get('/github/auth', passport.authenticate('github', { scope : ['user:email'] }))
router.get('/github/auth/connect', passport.authenticate('connectGitHub', { scope : ['user:email'] }))

router.get('/github', async (req, res, next) =>
    passport.authenticate('github', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && !user && info.status === 302) return res.status(info.status).send(JSON.stringify(info, null, 2))
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user)
            return res.cookie('jwt-token', jwt.sign({
                id: user._id,
                email: user.email,
                auth: {
                    status: false,
                    '2FA': user.security['2FA']
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

router.get('/github/connect', async (req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user && (req.body = {...req.query, ...user}))
            passport.authenticate('connectGitHub', (err, github, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(github) return res.send(JSON.stringify(info, null, 2))
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.get('/google/auth', passport.authenticate('google', { scope : ['email'] }))
router.get('/google/auth/connect', passport.authenticate('connectGoogle', { scope : ['email'] }))

router.get('/google', async (req, res, next) =>
    passport.authenticate('google', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && !user && info.status === 302) return res.status(info.status).send(JSON.stringify(info, null, 2))
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user)
            return res.cookie('jwt-token', jwt.sign({
                id: user._id,
                email: user.email,
                auth: {
                    status: false,
                    '2FA': user.security['2FA']
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

router.get('/google/connect', async (req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user && (req.body = {...req.query, ...user}))
            passport.authenticate('connectGoogle', (err, google, info) => {
                if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
                else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
                else if(google) return res.send(JSON.stringify(info, null, 2))
                else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
            })(req, res, next)
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
)

router.get('/:provider/register', async (req, res, next) => {
    req.body = {...req.query, provider: req.params.provider}
    passport.authenticate('getOAuthData', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({status: 500, message: MSG_DESC[0]}, null, 2))
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify(info, null, 2))
        else if(user) return res.send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
})

router.post('/:provider/register', async (req, res, next) => {
    req.body = {...req.body, provider: req.params.provider}
    passport.authenticate('registerOAuth', (err, user, info) => {
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
                maxAge: 86400000,
                httpOnly: true,
                secure: status,
                sameSite: status ? 'none' : 'strict'
            }).send(JSON.stringify(info, null, 2))
        else return res.status(504).send(JSON.stringify({status: 504, message: MSG_DESC[34]}, null, 2))
    })(req, res, next)
})

module.exports = router