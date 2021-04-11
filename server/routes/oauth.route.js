const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = require('express').Router();

let BlacklistedToken = require('../models/blacklisted-token.model');
let User = require('../models/users.model');
const MSG_DESC = require('../lib/callback');

const status = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;

router.get('/github/auth', passport.authenticate('github', { scope : ['user:email'] }));
router.get('/github/auth/connect', passport.authenticate('connectGitHub', { scope : ['user:email'] }));

router.get('/github', async (req, res, next) => {
    passport.authenticate('github', (err, user, info) => {
        console.log(err, user, info)
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && info.status ? info.status >= 400 ? true : false : false) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(info && info.status === 302) return res.status(info.status).send(JSON.stringify({statusCode: info.status, type: info.type, url: info.url}, null, 2));
        else if(user){
            return res.cookie('jwt-token', jwt.sign({
                id: user.id,
                email: user.email
            }, jwtSecret, { expiresIn: '1d' }), {
                path: '/',
                maxAge: 86400000,
                httpOnly: true,
                secure: status,
                sameSite: status ? 'none' : 'strict'
            }).send(JSON.stringify({
                statusCode: 200,
                message: MSG_DESC[2],
                id: user.id
            }, null, 2));
        }
    })(req, res, next)
})

router.get('/github/connect', async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && info.status ? info.status >= 400 ? true : false : true) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user){
            BlacklistedToken.findOne({ token: req.cookies['jwt-token'] }, (err, isListed) => {
                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                else if(isListed) res.status(403).json({statusCode: 403, message: MSG_DESC[15]});
                else if(!isListed){
                    passport.authenticate('connectGitHub', (err, userGithub, info) => {
                        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                        else if(info && info.status >= 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
                        else if(userGithub && userGithub.email === user.email){
                            User.findOne({email: user.email, 'thirdParty.github': false}, (err, data) => {
                                if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                                else if(!data) return res.status(400).json({statusCode: 400, message: MSG_DESC[27]});
                                else if(data){
                                    data.thirdParty.isThirdParty = true
                                    data.thirdParty.github = true
                                    data.thirdParty.verified = true
                                    data.save()
                                    return res.status(200).json({statusCode: 200, message: MSG_DESC[26]});
                                }
                            })
                        }else return res.status(403).json({statusCode: 403, message: MSG_DESC[16]});
                    })(req, res, next)
                }
            })
        }
    })(req, res, next)
})

router.get('/google/auth', passport.authenticate('google', { scope : ['email'] }));
router.get('/google/auth/connect', passport.authenticate('connectGoogle', { scope : ['email'] }));

router.get('/google', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && info.status ? info.status >= 400 ? true : false : false) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(info && info.status === 302) return res.status(info.status).send(JSON.stringify({statusCode: info.status, type: info.type, url: info.url}, null, 2));
        else if(user){
            return res.cookie('jwt-token', jwt.sign({
                id: user.id,
                email: user.email
            }, jwtSecret, { expiresIn: '1d' }), {
                path: '/',
                maxAge: 86400000,
                httpOnly: true,
                secure: status,
                sameSite: status ? 'none' : 'strict'
            }).send(JSON.stringify({
                statusCode: 200,
                message: MSG_DESC[2],
                id: user.id
            }, null, 2));
        }
    })(req, res, next)
});

router.get('/google/connect', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && info.status ? info.status >= 400 ? true : false : true) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user){
            BlacklistedToken.findOne({ token: req.cookies['jwt-token'] }, (err, isListed) => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else if(isListed) res.status(401).json({statusCode: 403, message: MSG_DESC[15]});
                else if(!isListed){
                    passport.authenticate('connectGoogle', (err, userGoogle, info) => {
                        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                        else if(info && info.status >= 400) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
                        else if(userGoogle && userGoogle.email === user.email){
                            User.findOne({email: user.email, 'thirdParty.google': false}, (err, data) => {
                                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                                else if(!data) return res.status(400).json({statusCode: 400, message: MSG_DESC[25]});
                                else if(data){
                                    data.thirdParty.isThirdParty = true
                                    data.thirdParty.google = true
                                    data.thirdParty.verified = true
                                    data.save()
                                    return res.status(200).json({statusCode: 200, message: MSG_DESC[24]});
                                }
                            })
                        }else return res.status(403).json({statusCode: 403, message: MSG_DESC[16]});
                    })(req, res, next)
                }
            })
        }
    })(req, res, next)
})

router.post('/:provider/validate', (req, res, next) => {
    passport.authenticate('getOAuthData', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && info.status ? info.status >= 400 ? true : false : true) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user) return res.send(JSON.stringify({statusCode: info.status, userExists: info.message}, null, 2))
    })(req, res, next)
})

router.post('/:provider/register', (req, res, next) => {
    req.body = {...req.body, provider: req.params.provider}
    passport.authenticate('registerOAuth', (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && info.status ? info.status >= 400 ? true : false : true) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user) {
            req.logIn(user, err => {
                if(err) res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else return res.cookie('jwt-token', jwt.sign({
                        id: user.id,
                        email: user.email
                    }, jwtSecret, { expiresIn: '1d' }), {
                        path: '/',
                        maxAge: 86400000,
                        httpOnly: true,
                        secure: status,
                        sameSite: status ? 'none' : 'strict'
                    }).send(JSON.stringify({
                        statusCode: info.status,
                        message: info.message,
                        id: user.id,
                    }, null, 2));
            })
        }
    })(req, res, next)
})

module.exports = router;