const bcrypt = require('bcrypt');
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtConfig');
const MSG_DESC = require('../config/libraries');
let User = require('../models/users.model');
let BlacklistedToken = require('../models/blacklisted-token.model');
const SALT_WORK_FACTOR = 12;

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && (info.status ? info.status >= 400 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user) {
            req.logIn(user, err => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else {
                    res.json({
                        statusCode: info.status,
                        message: info.message,
                        id: user.id,
                        token: jwt.sign({ id: user.id, email: user.email }, jwtSecret.secret, { expiresIn: '1d' })
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
                else {
                    res.json({
                        statusCode: info.status,
                        message: info.message,
                        id: user.id,
                        token: jwt.sign({ id: user.id, email: user.email }, jwtSecret.secret, { expiresIn: '1d' })
                    })
                }
            });
        }
    })(req, res, next)
})

router.get('/user', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user){
            BlacklistedToken.findOne({ token: req.query.token }, (err, isListed) => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else if(isListed) return res.status(401).json({statusCode: 401, message: MSG_DESC[15]});
                else if(!isListed){
                    res.json({
                        statusCode: 200,
                        message: MSG_DESC[5],
                        id: user._id,
                        email: user.email
                    });
                }
            })
        }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
    })(req, res, next)
})

router.put('/user', (req, res, next) => {
    const {id, oldPassword, newPassword, confirmPassword} = req.body;
    if(!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({statusCode: 400, message: MSG_DESC[11]});
    else if(oldPassword.length < 6 || oldPassword.length > 40 || newPassword.length < 6 || newPassword.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return res.status(500).json({statusCode: 400, message: MSG_DESC[9]});
    else if(newPassword !== confirmPassword) return res.status(400).json({statusCode: 400, message: MSG_DESC[7]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === id){
                User.findById(id, (err, user) => {
                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                    else if(!user) return res.status(400).json({statusCode: 400, message: MSG_DESC[8]});
                    else if(user) {
                        bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
                            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                            else if(!isMatch) return res.status(400).json({statusCode: 400, message: MSG_DESC[10]});
                            else if(isMatch){
                                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                                    else {
                                        bcrypt.hash(newPassword, salt, (err, hash) => {
                                            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                                            else {
                                                BlacklistedToken.findOne({ token: req.body.token }, (err, isListed) => {
                                                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                                                    else if(isListed) return res.status(401).json({statusCode: 401, message: MSG_DESC[15]});
                                                    else if(!isListed){
                                                        const blacklistedToken = new BlacklistedToken ({ userId: req.body.id, token: req.body.token })
                                                        blacklistedToken.save()
                                                        user.password = hash;
                                                        user.save()
                                                        res.json({
                                                            statusCode: 200,
                                                            message: MSG_DESC[5],
                                                            id: user.id,
                                                            token: jwt.sign({ id: user.id, email: user.email }, jwtSecret.secret, { expiresIn: '1d' })
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
                })
            }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
        })(req, res, next)
    }
})

router.post('/logout', (req, res, next) => {
    const {id, email} = req.body;
    if(!id || !email) return res.status(400).json({statusCode: 400, message: MSG_DESC[3]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                const blacklistedToken = new BlacklistedToken ({ userId: id, token: req.get('Authorization').slice(4) })
                blacklistedToken.save();
                res.json({ statusCode: 200, message: MSG_DESC[3] });
            }else return res.status(401).json({statusCode: 401, message: MSG_DESC[16]});
        })(req, res, next)
    }
})

module.exports = router;