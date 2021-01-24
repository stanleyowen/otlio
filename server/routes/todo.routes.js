const router = require('express').Router();
let Todo = require('../models/todo.models');
let User = require('../models/users.models');

const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const SECRET_KEY = process.env.SECRET_KEY;
const TOKEN_KEY = process.env.TOKEN_KEY;
const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'No Token Provided',
    'Token Mismatch',
    'Oops! Username or Token is Invalid',
    'Please Make Sure to Fill Out All the Required Fields !',
    'Please Provide a Valid Date !',
    'Please Provide a Valid Email Address !',
    'Please Provide a Title less than 40 characters !',
    'Please Provide a Label less than 20 characters !',
    'Please Provide a Description Less than 120 characters !',
    'No Data Found',
    'Data Deleted Successfully',
    'Can\'t Update Todo: No Data Changed',
    'Data Updated Successfully'
]

router.post('/delete', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const email = req.body.email;
    const token = req.body.token;
    const id = req.body.id;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[1]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!id || !token) return res.status(400).json({"code":400, "message":ERR_MSG[4]});
        else {
            User.findOne({email, token}, (err, user) => {
                if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                else if(!user) return res.status(404).json({"code":404, "message":ERR_MSG[10]});
                else {
                    Todo.findByIdAndDelete(id, (err, todoData) => {
                        if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                        else if(!todoData) return res.status(404).json({"code":404, "message":ERR_MSG[10]});
                        else return res.json({"code":200, "message":ERR_MSG[11]});
                    })
                }
            })
        }
    } else return res.status(401).json({"code":401, "message":ERR_MSG[2]});
})

router.post('/update', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const email = req.body.email;
    const token = req.body.token;
    const id = req.body.id;
    const title = req.body.title;
    const label = req.body.label;
    const description = req.body.description;
    const unformattedDate = req.body.date;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[1]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!id || !token || !title || !label || !unformattedDate) return res.status(400).json({"code":400, "message":ERR_MSG[4]});
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({"code":400, "message":ERR_MSG[6]});
        else if(title.length > 40) return res.status(400).json({"code":400, "message":ERR_MSG[7]});
        else if(label.length > 20) return res.status(400).json({"code":400, "message":ERR_MSG[8]});
        else if(description && description.length > 120) return res.status(400).json({"code":400, "message":ERR_MSG[9]});
        else if(unformattedDate.length !== 10 || DATE_VAL.test(String(unformattedDate)) === false) return res.status(400).json({"code":400, "message":ERR_MSG[5]});
        else {
            User.findOne({email, token}, (err, user) => {
                if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                else if(!user) return res.status(404).json({"code":404, "message":ERR_MSG[10]});
                else {
                    Todo.findById(id, (err, todoData) => {
                        if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                        else if(!todoData) return res.status(404).json({"code":404, "message":ERR_MSG[10]});
                        else {
                            if(title === todoData.title && label === todoData.label && Date.parse(unformattedDate) === Date.parse(todoData.date)){
                                if(description && description !== todoData.description){
                                    todoData.title = title;
                                    todoData.label = label;
                                    todoData.description = description;
                                    todoData.date = Date.parse(unformattedDate);
                                    todoData.save();
                                    res.json({"code":200, "email":ERR_MSG[13]})
                                }
                                else return res.status(400).json({"code":400, "message":ERR_MSG[12]});
                            }else {
                                todoData.title = title;
                                todoData.label = label;
                                todoData.description = description;
                                todoData.date = Date.parse(unformattedDate);
                                todoData.save();
                                res.json({"code":200, "email":ERR_MSG[13]});
                            }
                        }
                    })
                }
            })
        }
    } else return res.status(401).json({"code":401, "message":ERR_MSG[2]});
})

router.post('/getData', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const email = req.body.email;
    const token = req.body.token;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[1]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!email || !token) return res.status(400).json({"code":400, "message":ERR_MSG[4]});
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({"code":400, "message":ERR_MSG[6]});
        else {
            User.findOne({email, token}, (err, isMatch) => {
                if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                else if(!isMatch) return res.status(404).json({"code":404, "message":ERR_MSG[3]});
                else {
                    Todo.find({email}, (err, todoData) => {
                        if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                        else { res.json(todoData) }
                    })
                }
            })
        }
    } else return res.status(401).json({"code":401, "message":ERR_MSG[2]});
})

router.post('/add', (req,res) => {
    const CLIENT_SECRET_KEY = req.body.SECRET_KEY;
    const email = req.body.email;
    const title = req.body.title;
    const label = req.body.label;
    const description = req.body.description;
    const unformattedDate = req.body.date;
    const token = req.body.token;
    if(!CLIENT_SECRET_KEY) return res.status(401).json({"code":401, "message":ERR_MSG[1]});
    else if(SECRET_KEY === CLIENT_SECRET_KEY){
        if(!email || !title || !label || !unformattedDate || !token ) return res.status(400).json({"code":400, "message":ERR_MSG[4]});
        else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({"code":400, "message":ERR_MSG[6]});
        else if(title.length > 40) return res.status(400).json({"code":400, "message":ERR_MSG[7]});
        else if(label.length > 20) return res.status(400).json({"code":400, "message":ERR_MSG[8]});
        else if(description && description.length > 120) return res.status(400).json({"code":400, "message":ERR_MSG[9]});
        else if(unformattedDate.length !== 10 || DATE_VAL.test(String(unformattedDate)) === false) return res.status(400).json({"code":400, "message":ERR_MSG[5]});
        else {
            User.findOne({email, token}, (err, isMatch) => {
                if(err) return res.status(500).json({"code":500, "message":ERR_MSG[0]});
                else if(!isMatch) return res.status(404).json({"code":404, "message":ERR_MSG[3]});
                else {
                    const date = Date.parse(unformattedDate);
                    const newTodo = new Todo({ email, title, label, description, date })
                    newTodo.save()
                    .then(() => res.json({"message":"Todo Added Successfully !"}))
                    .catch(() => res.status(500).json({"code":500, "message":ERR_MSG[0]}));
                }
            })
        }
    } else return res.status(401).json({"code":401, "message":ERR_MSG[2]});
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