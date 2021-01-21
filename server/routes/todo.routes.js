const router = require('express').Router();
const Exercise = require('../models/todo.models');
let Todo = require('../models/todo.models');
let User = require('../models/users.models');

const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const SECRET_KEY = process.env.SECRET_KEY;
const TOKEN_KEY = process.env.TOKEN_KEY;
const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'Oops! Looks like the Email you registered has alreaady existed',
    'Oops! Username or Token is Invalid',
    'Please Make Sure to Fill Out All the Required Fields !',
    'Please Provide a Valid Email Address !',
    'Please Make Sure Both Password are Match !',
    'Please Provide an Email between 6 ~ 40 digits !',
    'Please Provide a Password between 6 ~ 40 digits !',
    'No Token Provided',
    'Token Mismatch',
    'Please Provide a Title less than 40 digits !',
    'Please Provide a Label less than 20 digits !'
]

const generateToken = () => {
    const randomToken = require('random-token').create(TOKEN_KEY);
    return randomToken(80);
}

router.post('/add', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const email = req.body.email;
    const title = req.body.title;
    const label = req.body.label;
    const description = req.body.description;
    const date = Date.parse(req.body.date);
    const token = req.body.token;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[8]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!email || !title || !label || !date || !token ) return res.status(400).json({"code":401, "message":ERR_MSG[3]});
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({"code":400, "message":ERR_MSG[4]});
        else if(title.length > 40) return res.status(400).json({"code":400, "message":ERR_MSG[10]});
        else {
            User.findOne({email}, (err, user) => {
                if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                else if(!user) return res.status(404).json({"code":404, "message":ERR_MSG[2]});
                else {
                    User.findOne({token}, (err, isMatch) => {
                        if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                        else if(!isMatch) return res.status(404).json({"code":404, "message":ERR_MSG[2]});
                        else {
                            const newExercise = new Exercise({ email, title, label, description, date })
                            newExercise.save()
                            .then(() => {res.json({"message":"Todo Added Successfully !"})})
                            .catch(() => res.status(500).json({"code":500, "message":ERR_MSG[0]}))
                        }
                    })
                }
            })
        }
    }
    else return res.status(401).json({"code":401, "message":ERR_MSG[9]});
})

router.route('/:id').delete((req,res) => {
    Exercise.findByIdAndDelete(req.params.id)
    .then(res.json('Exercises Deleted!'))
    .catch(err => res.status(400).json('Error: '+err));
})

router.route('/:username').get((req,res) => {
    Exercise.find({username: req.params.username})
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json('Error :'+err));
})

module.exports = router;