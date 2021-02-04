const router = require('express').Router();
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtConfig');
let User = require('../models/users.model');

const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const SECRET_KEY = process.env.SECRET_KEY;
const TOKEN_KEY = process.env.TOKEN_KEY;
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

const generateToken = () => {
    const randomToken = require('random-token').create(TOKEN_KEY);
    return randomToken(80);
}

/*router.post('/getUserByToken', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const token = req.body.token;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[8]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!token) return res.status(400).json({"code":400, "message":ERR_MSG[8]});
        else {
            User.findOne({token}, (err, user) => {
                if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                else if(!user) return res.status(404).json({"code":404, "message":ERR_MSG[2]});
                else {
                    const token = generateToken();
                    user.token = token;
                    user.save();
                    res.json({"message":"success", "email":user.email, "token":token})
                }
            })
        }
    }
    else return res.status(401).json({"code":401, "message":ERR_MSG[9]});
});*/

/*router.post('/login', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const email = req.body.email;
    const password = req.body.password;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[8]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!email || !password) return res.status(400).json({"code":400, "message":ERR_MSG[3]});
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({"code":400, "message":ERR_MSG[4]});
        else {
            User.findOne({email}, (err, user) => {
                if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                else if(!user) return res.status(404).json({"code":404, "message":ERR_MSG[2]});
                else if(user){
                    user.comparePassword(password, (err, isMatch) => {
                        if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                        else if(!isMatch) return res.status(404).json({"code":404, "message":ERR_MSG[2]});
                        else if(isMatch){
                            const token = generateToken();
                            user.token = token;
                            user.save()
                            res.json({"message":"success", "token":token, "email": user.email})
                        }
                    })
                }
            })
        }
    }
    else return res.status(401).json({"code":401, "message":ERR_MSG[9]});
});*/

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
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"statusCode":401, "message":ERR_MSG[8]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
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
                                res.status(200).json({"statusCode": info.status, "message": info.message, "id": user.id});
                            }
                        })
                    }
                })
            }

        })(req, res, next)
    } else return res.status(401).json({"statusCode":401, "message":ERR_MSG[9]});
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