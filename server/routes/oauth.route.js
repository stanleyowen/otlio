const axios = require('axios');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = require('express').Router();
const MSG_DESC = require('../lib/callback');
let User = require('../models/users.model');

const jwtSecret = process.env.JWT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET;

router.get('/github', async (req, res) => {
    const code = req.query.code;
    await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`,
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
                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
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
                            url: `/oauth/github/${encodeURIComponent(email)}`
                        });
                    }else if(user){
                        if (user.thirdParty.isThirdParty && user.thirdParty.status === "Pending"){
                            res.status(302).json({
                                statusCode: 302,
                                type: 'redirect',
                                url: `/oauth/github/${encodeURIComponent(email)}`
                            });
                        }else if(user.thirdParty.isThirdParty && user.thirdParty.status === "Success") {
                            res.status(200).json({
                                statusCode: 200,
                                status: MSG_DESC[2],
                                id: user.id,
                                token: jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1d' })
                            });
                        }else return res.status(400).json({statusCode: 400, message: MSG_DESC[24] });
                    }
                })
            })
            .catch(() => {return res.status(500).json({statusCode: 500, message: MSG_DESC[0]})})
        }else res.status(400).json(result.data);
    })
    .catch(() => { return res.status(500).json({statusCode: 500, message: MSG_DESC[0]})})
})

router.get('/google/auth', passport.authenticate('google', { scope : ['email'] }));

router.get('/google', (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/error' }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
        else if(info && info.status ? info.status >= 400 : info.status = 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(info && info.status === 302) return res.status(info.status).json({statusCode: info.status, type: info.type, url: info.url});
        else if(user && info.status === 200){
            return res.json({
                statusCode: 200,
                status: MSG_DESC[2],
                id: user.id,
                token: jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1d' })
            });
        }
    })(req, res, next)
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
                            res.json({
                                statusCode: info.status,
                                message: info.message,
                                id: user.id,
                                token: jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1d' })
                            });
                        }
                    })
                }
            })
        }
    })(req, res, next)
})

module.exports = router;