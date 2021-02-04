const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtConfig');
let User = require('../models/users.model');

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
    'Token Mismatch'
]

router.get('/getUserByToken', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(info.message);
        else if(info) return res.status(info.status ? info.status : info.status = 401).json({"statusCode": info.status, "message": info.message});
        else if(user.id === req.query.id){
            User.findById(req.query.id, (err, userInfo) => {
                if(err) return res.status(500).send(info.message);
                else if(userInfo){
                    res.status(200).json({
                        auth: true,
                        email: userInfo.email,
                        password: userInfo.password
                    });
                }else return res.status(400).send('Not Found');
            })
        }
        else return res.status(400).send('Not Founds');
    })(req, res, next)
})

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if(err) return res.status(info.status ? info.status : info.status = 500).json({"statusCode": info.status, "message": info.message});
        else if(info && info.status >= 400) return res.status(info.status ? info.status : info.status = 400).json({"statusCode": info.status, "message": info.message});
        else if(user) {
            req.logIn(user, err => {
                if(err) return res.status(info.status ? info.status : info.status = 500).json({"statusCode": info.status, "message": info.message});
                else {
                    User.findOne({ email: user.email }, (err, user) => {
                        if(err) return res.status(500).send(ERR_MSG[0]);
                        else {
                            const token = jwt.sign({ id: user.id }, jwtSecret.secret);
                            res.status(200).json({"statusCode": info.status, "message": info.message, "id": user.id, "token": token});
                        }
                    })
                }
            })
        }
    })(req, res, next)
})

router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if(err) return res.status(500).send(info.message);
        else if(info) return res.status(info.status ? info.status : info.status = 400).json({"statusCode": info.status, "message": info.message});
        else if(user){
            req.logIn(user, err => {
                if(err) return res.status(info.status ? info.status : info.status = 500).json({"statusCode": info.status, "message": info.message});
                else {
                    User.findOne({ email: user.email }, (err, isFound) => {
                        if(err) return res.status(500).json({"message": ERR_MSG[0]});
                        else if(isFound){
                            const token = jwt.sign({ id: user.id }, jwtSecret.secret);
                            return res.status(200).json({
                                auth: true,
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