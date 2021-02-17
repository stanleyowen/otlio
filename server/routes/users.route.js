const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtConfig');
let User = require('../models/users.model');
let BlacklistedToken = require('../models/blacklisted-token.model');

const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'Oops! Looks like the Email you registered has alreaady existed',
    'Oops! Username or Password is Invalid',
    'Please Make Sure to Fill Out All the Required Fields !',
    'Please Provide a Valid Email Address !',
    'Please Make Sure Both Passwords are Match !',
    'Please Provide an Email between 6 ~ 40 characters !',
    'Please Provide a Password between 6 ~ 40 characters !',
    'No Token Provided',
    'Token Mismatch',
    'Token Expired'
]

router.get('/getUserByToken', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 401).json({statusCode: info.status, message: info.message});
        else if(user.id === req.query.id){
            BlacklistedToken.findOne({ token: req.query.token }, (err, isListed) => {
                if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                else if(isListed) return res.status(401).json({statusCode: 401, message: ERR_MSG[10]});
                else if(!isListed){
                    User.findById(req.query.id, (err, userInfo) => {
                        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                        else if(userInfo){
                            res.json({
                                auth: true,
                                message: 'Authentication Success',
                                email: userInfo.email
                            });
                        }else return res.status(401).json({message: 'Authentication Failed'});
                    })
                }
            })
        }else return res.status(401).json({message: 'Authentication Failed'});
    })(req, res, next)
})

router.get('/logout', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 401).json({statusCode: info.status, message: info.message});
        else if(user.id === req.query.id){
            User.findById(req.query.id, (err, userInfo) => {
                if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                else if(userInfo){
                    const blacklistedToken = new BlacklistedToken ({ userId: req.query.id, token: req.query.token })
                    blacklistedToken.save()
                    res.json({
                        auth: true,
                        message: 'Logout Success',
                        email: userInfo.email
                    });
                }else return res.status(401).json({message: 'Authentication Failed'});
            })
        }else return res.status(401).json({message: 'Authentication Failed'});
    })(req, res, next)
})

router.post('/changePassword', (req, res, next) => {
    passport.authenticate('changePassword', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({"statusCode": info.status, "message": info.message});
        else if(user) {
            req.logIn(user, err => {
                if(err) return res.status(info.status ? info.status : info.status = 500).json({statusCode: info.status, message: info.message});
                else {
                    User.findOne({ email: user.email }, (err, user) => {
                        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                        else {
                            const token = jwt.sign({ id: user.id }, jwtSecret.secret, { expiresIn: '1d' });
                            res.json({
                                statusCode: info.status,
                                message: info.message,
                                id: user.id,
                                token: token
                            });
                        }
                    })
                }
            })
        }
    })(req, res, next)
})

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({"statusCode": info.status, "message": info.message});
        else if(user) {
            req.logIn(user, err => {
                if(err) return res.status(info.status ? info.status : info.status = 500).json({statusCode: info.status, message: info.message});
                else {
                    User.findOne({ email: user.email }, (err, user) => {
                        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                        else {
                            const token = jwt.sign({ id: user.id }, jwtSecret.secret, { expiresIn: '1d' });
                            res.json({
                                statusCode: info.status,
                                message: info.message,
                                id: user.id,
                                token: token
                            });
                        }
                    })
                }
            })
        }
    })(req, res, next)
})

router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user){
            req.logIn(user, err => {
                if(err) return res.status(info.status ? info.status : info.status = 500).json({statusCode: info.status, message: info.message});
                else {
                    User.findOne({ email: user.email }, (err, isFound) => {
                        if(err) return res.status(500).json({message: ERR_MSG[0]});
                        else if(isFound){
                            const token = jwt.sign({ id: user.id }, jwtSecret.secret, { expiresIn: '1d' });
                            res.json({
                                auth: true,
                                message: info.message,
                                id: user.id,
                                token: token
                            })
                        }
                    })
                }
            });
        }
    })(req, res, next)
})

module.exports = router;