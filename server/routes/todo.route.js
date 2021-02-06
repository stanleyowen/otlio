const router = require('express').Router();
const passport = require('passport');
let Todo = require('../models/todo.model');
let User = require('../models/users.model');

const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const SECRET_KEY = process.env.SECRET_KEY;
const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'No Token Provided',
    'Token Mismatch',
    'Oops! Username or Token is Invalid',
    'Missing Credentials',
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

router.post('/delete', (req,res,next) => {
    const email = req.body.email;
    const objId = req.body.objId;
    const id = req.body.id;
    if(!email || !objId || !id) return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 401).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                User.findById(id, (err, userInfo) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else if(userInfo){
                        if(user.email === email){
                            Todo.findByIdAndDelete(objId, (err, todoData) => {
                                if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                                else if(!todoData) return res.status(404).json({statusCode: 404, message: ERR_MSG[10]});
                                else if(todoData) return res.json({statusCode: 200, message: ERR_MSG[11]});
                            })
                        }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                    }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                })
            }else return res.status(401).json({message: 'Authentication Failed'});
        })(req, res, next)
    }
})

router.post('/update', (req,res,next) => {
    const email = req.body.email;
    const id = req.body.id;
    const objId = req.body.objId;
    const title = req.body.title;
    const label = req.body.label;
    const description = req.body.description;
    const unformattedDate = req.body.date;
    if(!email || !objId || !id || !title || !label || !unformattedDate) return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({"code":400, "message":ERR_MSG[6]});
    else if(title.length > 40) return res.status(400).json({"code":400, "message":ERR_MSG[7]});
    else if(label.length > 20) return res.status(400).json({"code":400, "message":ERR_MSG[8]});
    else if(description && description.length > 120) return res.status(400).json({"code":400, "message":ERR_MSG[9]});
    else if(unformattedDate.length !== 10 || DATE_VAL.test(String(unformattedDate)) === false) return res.status(400).json({"code":400, "message":ERR_MSG[5]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 401).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                User.findById(id, (err, userInfo) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else if(userInfo){
                        if(user.email === email){
                            Todo.findById(objId, (err, todoData) => {
                                if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                                else if(!todoData) return res.status(404).json({statusCode: 404, message: ERR_MSG[10]});
                                else if(todoData){
                                    if(title === todoData.title && label === todoData.label && Date.parse(unformattedDate) === Date.parse(todoData.date)){
                                        if(description && description !== todoData.description){
                                            todoData.title = title;
                                            todoData.label = label;
                                            todoData.description = description;
                                            todoData.date = Date.parse(unformattedDate);
                                            todoData.save();
                                            res.json({statusCode: 200, message: ERR_MSG[13]})
                                        }
                                        else return res.status(400).json({statusCode: 400, message: ERR_MSG[12]});
                                    }else {
                                        todoData.title = title;
                                        todoData.label = label;
                                        todoData.description = description;
                                        todoData.date = Date.parse(unformattedDate);
                                        todoData.save();
                                        res.json({statusCode: 200, message: ERR_MSG[13]});
                                    }
                                }
                            })
                        }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                    }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                })
            }else return res.status(401).json({message: 'Authentication Failed'});
        })(req, res, next)
    }
})

router.get('/getData/:id', (req,res,next) => {
    const email = req.query.email;
    const id = req.query.id;
    const objId = req.params.id;
    if(!email  || !objId || !id) return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 401).json({statusCode: info.status, message: info.message});
            else if(user.id === req.query.id && user.email === req.query.email){
                User.findById(id, (err, userInfo) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else if(userInfo){
                        if(user.email === email){
                            Todo.findById(objId, (err, todoData) => {
                                if(err) return res.status(500).json({statusCode:500, message: ERR_MSG[0]});
                                else { res.json(todoData) }
                            })
                        }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                    }
                })
            }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
        })(req, res, next)
    }
})

router.get('/getData', (req,res,next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 401).json({statusCode: info.status, message: info.message});
        else if(user.id === req.query.id && user.email === req.query.email){
            User.findById(req.query.id, (err, userInfo) => {
                if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                else if(userInfo){
                    if(user.email === req.query.email){
                        Todo.find({ email: req.query.email }, (err, todoData) => {
                            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                            else { res.json(todoData) }
                        })
                    }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                }
            })
        }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
    })(req, res, next)
})

router.post('/add', (req,res,next) => {
    const email = req.body.email;
    const id = req.body.id;
    const title = req.body.title;
    const label = req.body.label;
    const description = req.body.description;
    const unformattedDate = req.body.date;
    if(!email || !id || !title || !label || !unformattedDate) return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({statusCode: 400, message: ERR_MSG[6]});
    else if(title.length > 40) return res.status(400).json({statusCode: 400, message: ERR_MSG[7]});
    else if(label.length > 20) return res.status(400).json({statusCode: 400, message: ERR_MSG[8]});
    else if(description && description.length > 120) return res.status(400).json({statusCode: 400, message: ERR_MSG[9]});
    else if(unformattedDate.length !== 10 || DATE_VAL.test(String(unformattedDate)) === false) return res.status(400).json({statusCode: 400, message: ERR_MSG[5]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 401).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                User.findById(id, (err, userInfo) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else if(userInfo){
                        if(user.email === email){
                            const date = Date.parse(unformattedDate);
                            const newTodo = new Todo({ email, title, label, description, date })
                            newTodo.save()
                            .then(() => res.json({statusCode: 200, message: "Todo Added Successfully !"}))
                            .catch(() => res.status(500).json({statusCode: 500, message: ERR_MSG[0]}));
                        }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                    }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
                })
            }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
        })(req, res, next)
    }
})

module.exports = router;