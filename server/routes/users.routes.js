const router = require('express').Router();
const jsonParser = require('body-parser').json();
let User = require('../models/users.models');

const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const TOKEN_KEY = process.env.TOKEN_KEY;
const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'Oops! Looks like the Email you registered has alreaady existed',
    'Oops! Username or Password is Invalid',
    'Please Make Sure to Fill Out All the Required Fields !',
    'Please Prvide a Valid Email Address !',
    'Please Make Sure Both Password are Match !',
    'Please Provide an Email between 6 ~ 50 digits !',
    'Please Provide a Password between 6 ~ 30 digits !',
]
const generateToken = () => {
    const randomToken = require('random-token').create(TOKEN_KEY);
    return randomToken(100);
}

router.route('/').get((req, res) => {
    User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error :'+err));
})

router.route('/login').post((req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({username: username}, (err, user) => {
        if(!user){
            return res.status(400).json('User not found');
        }
        if(err){
            res.status(400).json('Error: '+err);
        }
        user.comparePassword(password, (err, isMatch) => {
            if(err){
                res.status(400).json('Error: '+err);
            }
            if(isMatch){
                res.json(user.token);
            }
            else{
                res.status(400).json('Password Mismatch');
            }
        })
    });
});

router.post('/register', jsonParser, (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPsw = req.body.confirmPsw;
    User.findOne({email}, (err, user) => {
        if(err) return res.status('500').json({"code":"500", "message":ERR_MSG[0]});
        else if(user) return res.status('400').json({"code":"400", "message":ERR_MSG[1]})
        else if(!user){
            if(!email || !password || !confirmPsw) return res.status('400').json({"code":"400", "message":ERR_MSG[3]});
            if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status('400').json({"code":"400", "message":ERR_MSG[4]});
            if(email.length < 6 || email.length > 50) return res.status('400').json({"code":"400", "message":ERR_MSG[6]});
            if(password.length < 6 || password.length > 30) return res.status('400').json({"code":"400", "message":ERR_MSG[7]});
            if(password !== confirmPsw) return res.status('400').json({"code":"400", "message":ERR_MSG[5]});
            const token = generateToken();
            const newUser = new User ({ email, password, token });
            console.log(newUser);
            newUser.save()
            .then(() => {
                res.json({"message":"success", token})
            })
            .catch(err => res.status(500).json({"code":"500", "message":ERR_MSG[0]}))
        }
    });
})

module.exports = router;