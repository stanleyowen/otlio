const router = require('express').Router();
let Exercise = require('../models/todo.models');
let User = require('../models/users.models');

const SECRET_KEY = process.env.SECRET_KEY;
const TOKEN_KEY = process.env.TOKEN_KEY;
const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'Oops! Looks like the Email you registered has alreaady existed',
    'Oops! Username or Password is Invalid',
    'Please Make Sure to Fill Out All the Required Fields !',
    'Please Provide a Valid Email Address !',
    'Please Make Sure Both Password are Match !',
    'Please Provide an Email between 6 ~ 40 digits !',
    'Please Provide a Password between 6 ~ 40 digits !',
    'No Token Provided',
    'Token Mismatch'
]

const generateToken = () => {
    const randomToken = require('random-token').create(TOKEN_KEY);
    return randomToken(80);
}

router.post('/add', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const email = req.body.email;
    const token = req.body.token;
    const description = req.body.description;
    const date = Date.parse(req.body.date);
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[8]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!email || !token) return res.status('401').json({"code":401, "message":ERR_MSG[3]});
        else {
            const newExercise = new Exercise({
                username: username,
                description: description,
                date: date,
            })
            newExercise.save()
            .then(res.json('Exercise Added!'))
            .catch(err => res.status(400).json('Error: '+err));
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