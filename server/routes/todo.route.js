const router = require('express').Router();
const passport = require('passport');
const { encrypt, decrypt } = require('../config/crypto');
let Todo = require('../models/todo.model');

const listLabel = ["Priority","Secondary","Important","Do Later"];
const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const ERR_MSG = [
    'Oops! Something Went Wrong, Please Try Again Later',
    'No Token Provided',
    'Token Mismatch',
    'Oops! Username or Token is Invalid',
    'Missing Credentials',
    'Please Provide a Valid Date !',
    'Please Provide a Valid Email Address !',
    'Please Provide a Title less than 40 characters !',
    'Please Provide a Valid Label !',
    'Please Provide a Description Less than 120 characters !',
    'No Data Found',
    'Data Deleted Successfully',
    'Can\'t Update Todo: No Data Changed',
    'Data Updated Successfully',
    'Invalid Credentials'
];
const validateLabel = (e) => {
    for (let a=0; listLabel.length; a++){
        if((a === listLabel.length-1) && (e === listLabel[a].toLowerCase())) return false;;
        if((a === listLabel.length-1) && (e !== listLabel[a].toLowerCase())) return true;
        else if(e === listLabel[a].toLowerCase()) return false;
    }
}

router.get('/data', (req,res,next) => {
    const {userId, id} = req.query;
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
        else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
        else if(user.id === userId){
            if(userId && id){
                Todo.findOne({_id: id, email: user.email}, (err, data) => {
                    if(err) return res.status(500).json({statusCode:500, message: ERR_MSG[0]});
                    else if(!data) return res.status(404).json({statusCode:404, message: ERR_MSG[10]});
                    else if(data) {
                        const todoData = {
                            _id: data._id,
                            email: data.email,
                            title: decrypt(data.title),
                            label: decrypt(data.label),
                            description: data.description.data === '' ? '' : decrypt(data.description),
                            date: decrypt(data.date)
                        };
                        res.json(todoData);
                    }
                })
            }else if(userId && !id) {
                Todo.find({ email: user.email }, (err, todoData) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else {
                        let data = [];
                        for (let x=0; x<todoData.length; x++){
                            const loopData = {
                                _id: todoData[x]._id,
                                email: todoData[x].email,
                                title: decrypt(todoData[x].title),
                                label: decrypt(todoData[x].label),
                                description: todoData[x].description.data === '' ? '' : decrypt(todoData[x].description),
                                date: decrypt(todoData[x].date)
                            };
                            data.push(loopData);
                        }
                        res.json(data);
                    }
                })
            }else return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
        }else return res.status(401).json({statusCode: 401, message: ERR_MSG[14]});
    })(req, res, next)
})

router.put('/data', (req,res,next) => {
    const {userId, id, title, label, description, date: unformattedDate} = req.body;
    if(!userId || !id || !title || !label || !unformattedDate) return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
    else if(title.length > 40) return res.status(400).json({"code":400, "message":ERR_MSG[7]});
    else if(validateLabel(label)) return res.status(400).json({"code":400, "message":ERR_MSG[8]});
    else if(description && description.length > 120) return res.status(400).json({"code":400, "message":ERR_MSG[9]});
    else if(unformattedDate.length !== 10 || DATE_VAL.test(String(unformattedDate)) === false) return res.status(400).json({"code":400, "message":ERR_MSG[5]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === userId){
                const updateData = {
                    title: encrypt(title),
                    label: encrypt(label),
                    description: description ? encrypt(description) : { data: '', iv: '' },
                    date: encrypt(String(Date.parse(unformattedDate)))
                }
                Todo.findOneAndUpdate({ _id: id, email: user.email }, updateData, (err, updated) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else if(!updated) return res.status(404).json({statusCode: 404, message: ERR_MSG[10]});
                    else if(updated) res.json({statusCode: 200, message: ERR_MSG[13]});
                })
            }else return res.status(401).json({message: 'Authentication Failed'});
        })(req, res, next)
    }
})

router.delete('/data', (req,res,next) => {
    const {email, objId, id} = req.body;
    if(!email || !objId || !id) return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                Todo.findByIdAndDelete(objId, (err, todoData) => {
                    if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
                    else if(!todoData) return res.status(404).json({statusCode: 404, message: ERR_MSG[10]});
                    else if(todoData) return res.json({statusCode: 200, message: ERR_MSG[11]});
                })
            }else return res.status(401).json({message: 'Authentication Failed'});
        })(req, res, next)
    }
})

router.post('/data', (req,res,next) => {
    const {email, id, title, label, description, date: unformattedDate} = req.body;
    if(!email || !id || !title || !label || !unformattedDate) return res.status(400).json({statusCode: 400, message: ERR_MSG[4]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({statusCode: 400, message: ERR_MSG[6]});
    else if(title.length > 40) return res.status(400).json({statusCode: 400, message: ERR_MSG[7]});
    else if(validateLabel(label)) return res.status(400).json({statusCode: 400, message: ERR_MSG[8]});
    else if(description && description.length > 120) return res.status(400).json({statusCode: 400, message: ERR_MSG[9]});
    else if(unformattedDate.length !== 10 || DATE_VAL.test(String(unformattedDate)) === false) return res.status(400).json({statusCode: 400, message: ERR_MSG[5]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: ERR_MSG[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                let dataDescription = { data: '', iv: '' };
                const date = Date.parse(unformattedDate);
                const dataTitle = encrypt(title);
                const dataLabel = encrypt(label);
                if(description){ dataDescription = encrypt(description) }
                const dataDate = encrypt(String(date));
                const todoData = {
                    email,
                    title: {
                        data: dataTitle.data,
                        iv: dataTitle.iv,
                    },
                    label: {
                        data: dataLabel.data,
                        iv: dataLabel.iv,
                    },
                    description: {
                        data: dataDescription.data,
                        iv: dataDescription.iv,
                    },
                    date: {
                        data: dataDate.data,
                        iv: dataDate.iv,
                    }
                }
                const newTodo = new Todo(todoData)
                newTodo.save()
                .then(() => res.json({statusCode: 200, message: "Todo Added Successfully !"}))
                .catch(err => res.status(500).json({statusCode: 500, message: err}));        
            }else return res.status(401).json({statusCode: 401, message: 'Authentication Failed'});
        })(req, res, next)
    }
})

module.exports = router;