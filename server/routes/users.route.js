const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = require('express').Router();

const { encrypt } = require('../lib/crypto');
const MSG_DESC = require('../lib/callback');
let BlacklistedToken = require('../models/blacklisted-token.model');

const jwtSecret = process.env.JWT_SECRET;
const status = process.env.NODE_ENV === 'production';

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user) {
            req.logIn(user, err => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else return res.cookie('jwt-token', jwt.sign({
                        id: user.id,
                        email: user.email
                    }, jwtSecret, { expiresIn: '1d' }), {
                        path: '/',
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: status,
                        sameSite: status ? 'none' : 'strict'
                    }).json({
                        statusCode: info.status,
                        message: info.message
                    })
            })
        }
    })(req, res, next)
})

router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user){
            req.logIn(user, err => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else return res.cookie('jwt-token', jwt.sign({
                        id: user.id,
                        email: user.email
                    }, jwtSecret, { expiresIn: '1d' }), {
                        path: '/',
                        expires: JSON.parse(req.body.rememberMe) ? new Date(Date.now() + 86400000) : false,
                        httpOnly: true,
                        secure: status,
                        sameSite: status ? 'none' : 'strict'
                    }).send(JSON.stringify({ statusCode: info.status, message: info.message }, null, 2));
            });
        }
    })(req, res, next)
})

router.get('/user', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user) return res.send(JSON.stringify({
                statusCode: 200,
                authenticated: true,
                message: MSG_DESC[5],
                id: user._id,
                email: user.email,
                thirdParty: user.thirdParty
            }, null, 2));
    })(req, res, next)
})

router.put('/user', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user){
            passport.authenticate('changePassword', { session: false }, (err, account, info) => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
                else if(account) return res.cookie('jwt-token', jwt.sign({
                        id: account.id,
                        email: account.email
                    }, jwtSecret, { expiresIn: '1d' }), {
                        path: '/',
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: status,
                        sameSite: status ? 'none' : 'strict'
                    }).send(JSON.stringify({
                        statusCode: info.status,
                        message: info.message
                    }, null, 2));
            })(req, res, next)
        }
    })(req, res, next)
})

router.get('/forgot-password', (req, res, next) => {
    req.params = req.query;
    passport.authenticate('tokenData', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else return res.send(JSON.stringify({ statusCode: info.status, message: info.message, email: user.email }, null, 2))
    })(req, res, next)
})

router.post('/forgot-password', (req, res, next) => {
    passport.authenticate('forgotPassword', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user) res.send(JSON.stringify({ statusCode: info.status, message: info.message }, null, 2))
    })(req, res, next)
})

router.post('/reset-password', (req, res, next) => {
    passport.authenticate('resetPassword', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user) return res.cookie('jwt-token', jwt.sign({
                id: user._id,
                email: user.email
            }, jwtSecret, { expiresIn: '1d' }), {
                path: '/',
                maxAge: 86400000,
                httpOnly: true,
                secure: status,
                sameSite: status ? 'none' : 'strict'
            }).send(JSON.stringify({ statusCode: info.status, message: info.message }, null, 2));
    })(req, res, next)
})

router.post('/logout', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user){
            new BlacklistedToken ({ userId: user.id, token: encrypt(req.cookies['jwt-token']) }).save();
            return res.cookie('jwt-token', '', {
                path: '/',
                maxAge: 0,
                httpOnly: true,
                secure: status,
                sameSite: status ? 'none' : 'strict'
            }).send(JSON.stringify({ statusCode: 200, message: MSG_DESC[3] }, null, 2));
        }
    })(req, res, next)
})

module.exports = router;