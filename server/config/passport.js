const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwtSecret = require('./jwtConfig');
const MSG_DESC = require('../config/libraries');
let User = require('../models/users.model');

const SALT_WORK_FACTOR = 12;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use('register', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const {confirmPassword} = req.body;
    if(!email || !password || !confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[11] })
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(password.length < 6 || password.length > 40 || confirmPassword.length < 6 || confirmPassword.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] })
    else if(password !== confirmPassword) return done(null, false, { status: 400, message: MSG_DESC[7] })
    else {
        User.findOne({email}, (err, user) => {
            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] })
            else if(user) return done(null, false, { status: 400, message: MSG_DESC[1] })
            else if(!user) {
                const newUser = new User ({ email, password })
                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] })
                    else {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] })
                            else {
                                newUser.password = hash;
                                newUser.save()
                                .then(user => { return done(null, user, { status: 200, message: MSG_DESC[4] }) })
                                .catch(() => { return done(null, false, { status: 500, message: MSG_DESC[0] }) })
                            }
                        })
                    }
                })
            }
        })
    }
}))

passport.use('login', new localStrategy({ usernameField: 'email', passwordField: 'password', session: false }, (email, password, done) => {
    User.findOne({email}, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) done(null, false, { status: 400, message: MSG_DESC[10] });
        else if(user){
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                else if(!isMatch) return done(null, false, { status: 400, message: MSG_DESC[10] });
                else if(isMatch) return done(null, user, { status: 200, message: MSG_DESC[2] });
            })
        }
    })
}))

passport.use('getOAuthData', new localStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const provider = req.params.provider;
    if(!provider) return done(null, false, { status: 400, message: MSG_DESC[11] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] })
    else if(email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[8] });
    User.findOne({email, 'thirdParty.provider': provider }, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) done(null, false, { status: 400, message: MSG_DESC[13] });
        else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.status === "Pending"){
                return done(null, user, { status: 200, message: true })
            }else done(null, false, { status: 400, message: MSG_DESC[13] });
        }
    })
}))

passport.use('registerOAuth', new localStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true, session: false }, (req, email, password, done) => {
    const provider = req.params.provider;
    if(!provider) return done(null, false, { status: 400, message: MSG_DESC[3] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false || email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: MSG_DESC[4] });
    else if(password.length < 6 || password.length > 40) return done(null, false, { status: 400, message: MSG_DESC[9] });
    User.findOne({email, 'thirdParty.provider': provider }, (err, user) => {
        if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
        else if(!user) done(null, false, { status: 400, message: MSG_DESC[13] });
        else if(user){
            if(user.thirdParty.isThirdParty && user.thirdParty.status === "Pending"){
                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                    if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                    else {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if(err) return done(null, false, { status: 500, message: MSG_DESC[0] });
                            else {
                                user.password = hash;
                                user.thirdParty.status = "Success";
                                user.save()
                                .then(user => { return done(null, user, { status: 200, message: MSG_DESC[4] }) })
                                .catch(() => { return done(null, false, { status: 500, message: MSG_DESC[0] }) })
                            }
                        })
                    }
                })
            }else done(null, false, { status: 400, message: MSG_DESC[13] });
        }
    })
}))

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: jwtSecret.secret,
};

passport.use('jwt', new JWTStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id, (err, user) => {
        if(err) done(null, false);
        else if(user) done(null, user);
        else done(null, false);
    })
}))

module.exports = passport;