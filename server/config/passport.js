const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwtSecret = require('./jwtConfig');
const User = require('../models/users.model');
const SALT_WORK_FACTOR = 12;

const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'Oops! Looks like the Email you registered has alreaady existed',
    'Invalid credentials',
    'Missing credentials',
    'Please Provide a Valid Email Address !',
    'Please Make Sure Both Passwords are Match !',
    'Please Provide an Email between 6 ~ 40 characters !',
    'Please Provide a Password between 6 ~ 40 characters !',
    'No Token Provided',
    'Token Mismatch',
    'Registration Success'
]

passport.use('register', new localStrategy({ usernameField: 'email', passwordField: 'password', session: false }, (email, password, done) => {
    if(!email || !password) return done(null, false, { status: 400, message: ERR_MSG[3] });
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return done(null, false, { status: 400, message: ERR_MSG[4] });
    else if(email.length < 6 || email.length > 40) return done(null, false, { status: 400, message: ERR_MSG[6] });
    else if(password.length < 6 || password.length > 40) return done(null, false, { status: 400, message: ERR_MSG[7] });
    else {
        User.findOne({email}, (err, user) => {
            if(err) return done(null, false, { status: 500, message: ERR_MSG[0] });
            else if(user) return done(null, false, { status: 400, message: ERR_MSG[1] });
            else if(!user) {
                const newUser = new User ({ email, password });
                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                    if(err) return done(null, false, { status: 500, message: ERR_MSG[0] });
                    else {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) return done(null, false, { status: 500, message: ERR_MSG[0] });
                            else {
                                newUser.password = hash;
                                newUser.save()
                                .then(user => { return done(null, user, { status: 200, message: ERR_MSG[10], id: user.id }) })
                                .catch(() => { return done(null, false, { status: 500, message: ERR_MSG[0] }) })
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
        if(err) return done(null, false, { status: 500, message: ERR_MSG[0] });
        else if(!user) done(null, false, { status: 400, message: ERR_MSG[3] });
        else if(user){
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) return done(null, false, { status: 500, message: ERR_MSG[0] });
                else if(isMatch) return done(null, user);
                else if(!isMatch) return done(null, false, { status: 400, message: ERR_MSG[3] });
            })
        }
    })
}))

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: jwtSecret.secret,
};

passport.use('jwt', new JWTStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id, (err, user) => {
        console.log(user);
        if(err) done(null, false);
        else if(user) done(null, user);
        else done(null, false);
    })
}))

module.exports = passport;