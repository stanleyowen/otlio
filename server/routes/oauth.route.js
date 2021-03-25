const axios = require('axios');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = require('express').Router();
const MSG_DESC = require('../lib/callback');
let BlacklistedToken = require('../models/blacklisted-token.model');
let User = require('../models/users.model');

const status = process.env.NODE_ENV;
const jwtSecret = process.env.JWT_SECRET;

router.get('/github/auth', passport.authenticate('github', { scope : ['user:email'] }));
router.get('/github/auth/connect', passport.authenticate('connectViaGithub', { scope : ['user:email'] }));

router.get('/github', async (req, res, next) => {
    passport.authenticate('github', { failureRedirect: '/error' }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(info && info.status === 302) return res.status(info.status).json({statusCode: info.status, type: info.type, url: info.url});
        else if(user && info.status === 200){
            return res.cookie('jwt-token', jwt.sign({
                id: user.id,
                email: user.email
            }, jwtSecret, { expiresIn: '1d' }), {
                maxAge: 86400000,
                httpOnly: true,
                secure: status === 'production' ? true : false,
                sameSite: status === 'production' ? 'none' : false
            }).json({
                statusCode: 200,
                message: MSG_DESC[2],
                id: user.id
            });
        }
    })(req, res, next)
})

router.get('/github/connect', async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user){
            BlacklistedToken.findOne({ token: req.cookies['jwt-token'] }, (err, isListed) => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else if(isListed) res.status(401).json({statusCode: 401, message: MSG_DESC[15]});
                else if(!isListed){
                    passport.authenticate('connectViaGithub', { failureRedirect: '/error' }, (err, userGithub, info) => {
                        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
                        else if(userGithub && info.status === 200){
                            if(!userGithub.thirdParty.isThirdParty && userGithub.email === user.email){
                                const userData = {
                                    thirdParty: {
                                        isThirdParty: true,
                                        provider: 'github',
                                        status: 'Success'
                                    }
                                }
                                User.findOneAndUpdate({email: user.email}, userData, (err, updated) => {
                                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                                    else if(updated) return res.status(200).json({statusCode: 200, message: MSG_DESC[26]});
                                    else if(!updated) return res.status(400).json({statusCode: 400, message: MSG_DESC[27]});
                                })
                            }else if(userGithub.thirdParty.isThirdParty) return res.status(400).json({statusCode: 400, message: MSG_DESC[28]});
                            else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
                        }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
                    })(req, res, next)
                }
            })
        }
    })(req, res, next)
})

router.get('/google/auth', passport.authenticate('google', { scope : ['email'] }));
router.get('/google/auth/connect', passport.authenticate('connectViaGoogle', { scope : ['email'] }));

router.get('/google', (req, res, next) => {
    const connect = req.query.connect;
    if(!connect){
        passport.authenticate('google', { failureRedirect: '/error' }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(info && info.status === 302) return res.status(info.status).json({statusCode: info.status, type: info.type, url: info.url});
            else if(user && info.status === 200){
                return res.cookie('jwt-token', jwt.sign({
                    id: user.id,
                    email: user.email
                }, jwtSecret, { expiresIn: '1d' }), {
                    maxAge: 86400000,
                    httpOnly: true,
                    secure: status === 'production' ? true : false,
                    sameSite: status === 'production' ? 'none' : false
                }).json({
                    statusCode: 200,
                    message: MSG_DESC[2],
                    id: user.id
                });
            }
        })(req, res, next)
    }else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user){
                BlacklistedToken.findOne({ token: req.cookies['jwt-token'] }, (err, isListed) => {
                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                    else if(isListed) res.status(401).json({statusCode: 401, message: MSG_DESC[15]});
                    else if(!isListed){
                        passport.authenticate('connectViaGoogle', { failureRedirect: '/error' }, (err, userGoogle, info) => {
                            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                            else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
                            else if(userGoogle && info.status === 200){
                                if(!userGoogle.thirdParty.isThirdParty && userGoogle.email === user.email){
                                    const userData = {
                                        thirdParty: {
                                            isThirdParty: true,
                                            provider: 'google',
                                            status: 'Success'
                                        }
                                    }
                                    User.findOneAndUpdate({email: user.email}, userData, (err, updated) => {
                                        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                                        else if(updated) return res.status(200).json({statusCode: 200, message: MSG_DESC[24]});
                                        else if(!updated) return res.status(400).json({statusCode: 400, message: MSG_DESC[25]});
                                    })
                                }else if(userGoogle.thirdParty.isThirdParty) return res.status(400).json({statusCode: 400, message: MSG_DESC[28]});
                                else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
                            }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
                        })(req, res, next)
                    }
                })
            }
        })(req, res, next)
    }
});

router.post('/:provider/validate', (req, res, next) => {
    passport.authenticate('getOAuthData', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user) return res.status(200).json({statusCode: info.status, userExists: info.message})
    })(req, res, next)
})

router.post('/:provider/register', (req, res, next) => {
    passport.authenticate('registerOAuth', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user) {
            req.logIn(user, err => {
                if(err) res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else {
                    User.findOne({ email: user.email }, (err, user) => {
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
                                message: info.message,
                                id: user.id,
                            });
                        }
                    })
                }
            })
        }
    })(req, res, next)
})

module.exports = router;