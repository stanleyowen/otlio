const passport = require('passport');
const router = require('express').Router();

let Todo = require('../models/todo.model');

const { encrypt, decrypt } = require('../lib/crypto');
const MSG_DESC = require('../lib/callback');

const listLabel = ["Priority","Secondary","Important","Do Later"];
const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateLabel = (e) => {
    for (let a=0; listLabel.length; a++){
        if((a === listLabel.length-1) && (e === listLabel[a].toLowerCase())) return false;
        if((a === listLabel.length-1) && (e !== listLabel[a].toLowerCase())) return true;
        else if(e === listLabel[a].toLowerCase()) return false;
    }
}

router.get('/data', (req, res, next) => {
    const {userId, id, email} = req.query;
    if(!userId || !email) return res.status(400).json({statusCode: 400, message: MSG_DESC[11]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === userId && user.email === email){
                if(id){
                    Todo.findOne({ _id: id, email }, (err, data) => {
                        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                        else if(!data) return res.status(404).json({statusCode: 404, message: MSG_DESC[13]});
                        else if(data){
                            return res.json({
                                _id: data._id,
                                email: data.email,
                                title: decrypt(data.title),
                                label: decrypt(data.label),
                                description: data.description.data === '' ? '' : decrypt(data.description),
                                date: decrypt(data.date)
                            });
                        }
                    })
                }else {
                    Todo.find({ email }, (err, data) => {
                        if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                        else {
                            let todoData = [];
                            for (let x=0; x<data.length; x++){
                                const loopData = {
                                    _id: data[x]._id,
                                    email: data[x].email,
                                    title: decrypt(data[x].title),
                                    label: decrypt(data[x].label),
                                    description: data[x].description.data === '' ? '' : decrypt(data[x].description),
                                    date: decrypt(data[x].date)
                                };
                                todoData.push(loopData);
                            }
                            return res.json(todoData);
                        }
                    })
                }
            }else return res.status(403).json({statusCode: 403, message: MSG_DESC[16]});
        })(req, res, next)
    }
})

router.put('/data', (req, res, next) => {
    const {userId, id, email, title, label, description, date} = req.body;
    if(!userId || !id || !email || !title || !label || !date) return res.status(400).json({statusCode: 400, message: MSG_DESC[11]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({statusCode: 400, message: MSG_DESC[8]});
    else if(title.length > 40) return res.status(400).json({statusCode: 400, message: MSG_DESC[17]});
    else if(validateLabel(label)) return res.status(400).json({statusCode: 400, message: MSG_DESC[18]});
    else if(description && description.length > 120) return res.status(400).json({statusCode: 400, message: MSG_DESC[19]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === userId && user.email === email){
                const updateData = {
                    title: encrypt(title),
                    label: encrypt(label),
                    description: description ? encrypt(description) : { data: '', iv: '' },
                    date: encrypt(date)
                }
                Todo.findOneAndUpdate({ _id: id, email: user.email }, updateData, (err, updated) => {
                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                    else if(!updated) return res.status(404).json({statusCode: 404, message: MSG_DESC[13]});
                    else if(updated) res.json({statusCode: 200, message: MSG_DESC[21]});
                })
            }else return res.status(403).json({statusCode: 403, message: MSG_DESC[16]});
        })(req, res, next)
    }
})

router.delete('/data', (req, res, next) => {
    const {id, email, objId} = req.body;
    if(!id || !email || !objId) return res.status(400).json({statusCode: 400, message: MSG_DESC[11]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({statusCode: 400, message: MSG_DESC[8]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                Todo.findOneAndDelete({ _id: objId, email }, (err, deleted) => {
                    if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
                    else if(!deleted) return res.status(404).json({statusCode: 404, message: MSG_DESC[13]});
                    else if(deleted) return res.json({statusCode: 200, message: MSG_DESC[22]});
                })
            }else return res.status(403).json({statusCode: 403, message: MSG_DESC[16]});
        })(req, res, next)
    }
})

router.post('/data', (req, res, next) => {
    const {email, id, title, label, description, date} = req.body;
    if(!email || !id || !title || !label || !date) return res.status(400).json({statusCode: 400, message: MSG_DESC[11]});
    else if(EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false) return res.status(400).json({statusCode: 400, message: MSG_DESC[8]});
    else if(title.length > 40) return res.status(400).json({statusCode: 400, message: MSG_DESC[17]});
    else if(validateLabel(label)) return res.status(400).json({statusCode: 400, message: MSG_DESC[18]});
    else if(description && description.length > 120) return res.status(400).json({statusCode: 400, message: MSG_DESC[19]});
    else {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if(err) return res.status(500).json({statusCode: 500, message: MSG_DESC[0]});
            else if(info) return res.status(info.status ? info.status : info.status = 400).json({statusCode: info.status, message: info.message});
            else if(user.id === id && user.email === email){
                let dataDescription = { data: '', iv: '' };
                const dataTitle = encrypt(title);
                const dataLabel = encrypt(label);
                if(description){ dataDescription = encrypt(description) }
                const dataDate = encrypt(date);
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
                new Todo(todoData).save()
                .then(() => res.json({statusCode: 200, message: MSG_DESC[23]}))
                .catch(() => res.status(500).json({statusCode: 500, message: MSG_DESC[0]}));        
            }else return res.status(403).json({statusCode: 403, message: MSG_DESC[16]});
        })(req, res, next)
    }
})

module.exports = router;