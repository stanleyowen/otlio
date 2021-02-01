const bcrypt = require('bcrypt');
const User = require('../models/users.models');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const SALT_WORK_FACTOR = 12;

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    });
});

passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({email})
    .then(user => {
        if(!user){
            const newUser = new User ({ email, password });
            bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user => { return done(null, user) })
                    .catch(err => { return done(null, false, { message: err }) })
                })
            })
        }else {
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;
                else if(isMatch) return done(null, user)
                else return done(null, false, { message: 'Wrong Password' })
            })
        }
    })
    .catch(err => { return done(null, false, {message: err}) })
}))

module.exports = passport;