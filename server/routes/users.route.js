const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

const MSG_DESC = require('../lib/callback');
let BlacklistedToken = require('../models/blacklisted-token.model');

const jwtSecret = process.env.JWT_SECRET;
const status = process.env.NODE_ENV;

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user) {
            req.logIn(user, err => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else {
                    res.cookie('jwt-token', jwt.sign({
                        id: user.id,
                        email: user.email
                    }, jwtSecret, { expiresIn: '1d' }), {
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: status === 'production' ? true : false,
                        sameSite: status === 'production' ? 'none' : false
                    }).json({
                        statusCode: info.status,
                        message: info.message
                    })
                }
            })
        }
    })(req, res, next)
})

router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user){
            req.logIn(user, err => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else return res.cookie('jwt-token', jwt.sign({
                        id: user.id,
                        email: user.email
                    }, jwtSecret, { expiresIn: '1d' }), {
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: status === 'production' ? true : false,
                        sameSite: status === 'production' ? 'none' : false
                    }).json({
                        statusCode: info.status,
                        message: info.message
                    })
            });
        }
    })(req, res, next)
})

router.get('/user', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user){
            BlacklistedToken.findOne({ token: req.cookies['jwt-token'] }, (err, isListed) => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else if(isListed) return res.status(401).json({statusCode: 401, message: MSG_DESC[15]});
                else if(!isListed){
                    return res.json({
                        statusCode: 200,
                        authenticated: true,
                        message: MSG_DESC[5],
                        id: user._id,
                        email: user.email,
                        thirdParty: user.thirdParty
                    });
                }
            })
        }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
    })(req, res, next)
})

router.put('/user', (req, res, next) => {
    const {id} = req.body;
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user.id === id){
            passport.authenticate('editAccount', { session: false }, (err, account, info) => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
                else {
                    const token = req.cookies['jwt-token']
                    const blacklistedToken = new BlacklistedToken ({ userId: id, token })
                    blacklistedToken.save()
                    return res.cookie('jwt-token', jwt.sign({
                        id: account._id,
                        email: account.email
                    }, jwtSecret, { expiresIn: '1d' }), {
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: status === 'production' ? true : false,
                        sameSite: status === 'production' ? 'none' : false
                    }).json({
                        statusCode: info.status,
                        message: info.message
                    });
                }
            })(req, res, next)

        }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
    })(req, res, next)
})

router.get('/forget-password', (req, res, next) => {
    req.params = req.query;
    passport.authenticate('getForgetPasswordData', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message})
        else return res.json({statusCode: info.status, message: info.message, email: user.email})
    })(req, res, next)
})

router.post('/forget-password', (req, res, next) => {
    passport.authenticate('forgetPassword', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message})
        else res.json({statusCode: info.status, message: info.message})
    })(req, res, next)
})

router.post('/reset-password', (req, res, next) => {
    passport.authenticate('resetPassword', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user) {
            return res.cookie('jwt-token', jwt.sign({
                id: user._id,
                email: user.email
            }, jwtSecret, { expiresIn: '1d' }), {
                maxAge: 86400000,
                httpOnly: true,
                secure: status === 'production' ? true : false,
                sameSite: status === 'production' ? 'none' : false
            }).json({
                statusCode: info.status,
                message: info.message
            });
        }
    })(req, res, next)
})

router.post('/logout', (req, res, next) => {
    const {id, email} = req.body;
    if(!id || !email) return res.status(400).json({statusCode: 400, message: MSG_DESC[3]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                const blacklistedToken = new BlacklistedToken ({ userId: id, token: req.cookies['jwt-token'] })
                blacklistedToken.save();
                return res.cookie('jwt-token', '', {
                    maxAge: 0,
                    httpOnly: true,
                    secure: status === 'production' ? true : false,
                    sameSite: status === 'production' ? 'none' : false
                }).json({ statusCode: 200, message: MSG_DESC[3] });
            }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
        })(req, res, next)
    }
})

module.exports = router;