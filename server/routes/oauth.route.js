const axios = require('axios');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = require('express').Router();
const jwtSecret = require('../config/jwtConfig');
let User = require('../models/users.model');

const CLIENT_ID = process.env.GITHUB_ID;
const CLIENT_URL = process.env.CLIENT_URL;
const CLIENT_SECRET = process.env.GITHUB_SECRET;

const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'Oops! Looks like the Email you registered has alreaady existed',
    'Invalid Credentials',
    'Missing Credentials',
    'Please Provide a Valid Email Address !',
    'Please Make Sure Both Passwords are Match !',
    'Please Provide an Email between 6 ~ 40 characters !',
    'Please Provide a Password between 6 ~ 40 characters !',
    'No Token Provided',
    'Token Mismatch',
    'Registration Success',
    'Login Success',
    'Password Changed Successfully',
    'User Not Exists',
]

router.get('/github', async (req, res) => {
    const code = req.query.code;
    await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`,
        headers: { accept: 'application/json' }
    })
    .then(async result => {
        const token = result.data.access_token;
        if(token){
            await axios({
                method: 'get',
                url: `https://api.github.com/user`,
                headers: { Authorization: 'token ' + token }
            })
            .then(user => {
                const email = user.data.email;
                User.findOne({ email }, (err, user) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else if(!user){
                        const dataModel = new User ({
                            email,
                            password: null,
                            thirdParty: {
                                isThirdParty: true,
                                provider: 'github',
                                status: 'Pending'
                            }
                        });
                        dataModel.save()
                        res.status(302).json({
                            statusCode: 302,
                            type: 'redirect',
                            url: `${CLIENT_URL}/oauth/github/${encodeURIComponent(email)}`
                        });
                    }else if(user){
                        if (user.thirdParty.status === "Pending"){
                            res.status(302).json({
                                statusCode: 302,
                                type: 'redirect',
                                url: `${CLIENT_URL}/oauth/github/${encodeURIComponent(email)}`
                            });
                        }
                        else {
                            const token = jwt.sign({ id: user.id }, jwtSecret.secret, { expiresIn: '1d' });
                            res.status(200).json({
                                statusCode: 200,
                                status: ERR_MSG[11],
                                id: user.id,
                                token: token
                            });
                        }
                    }
                })
            })
            .catch(err => console.log(err))
        }else res.status(400).json(result.data);
    })
    .catch(err => console.log(err))
})

router.post('/:provider/validate', (req, res, next) => {
    passport.authenticate('getOAuthData', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user) return res.status(200).json({statusCode: info.status, userExists: info.message})
    })(req, res, next)
})

router.post('/:provider/register', (req, res, next) => {
    passport.authenticate('registerOAuth', (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
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

module.exports = router;