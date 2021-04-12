const passport = require('passport');
const router = require('express').Router();

const MSG_DESC = require('../lib/callback');

router.get('/data', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user && (req.query = {...req.query, email: user.email})){
            passport.authenticate('todoData', { session: false }, (err, data, info) => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
                else if(data) return res.send(JSON.stringify(data, null, 2));
                else return done(err, null, {status: 404, message: MSG_DESC[13]});
            })(req, res, next)
        }else return res.status(504).send(JSON.stringify({ statusCode: 504, message: MSG_DESC[34] }, null, 2));
    })(req, res, next)
})

router.post('/data', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user && (req.body = {...req.body, email: user.email})){
            passport.authenticate('addTodo', { session: false }, (err, data, info) => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else if(info && (info.status ? info.status >= 300 ? true : false : false)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
                else if(data) return res.status(info.status).send(JSON.stringify({ statusCode: info.status, message: info.message }, null, 2))
                else return res.status(504).send(JSON.stringify({ statusCode: 504, message: MSG_DESC[34] }, null, 2));
            })(req, res, next)
        }else return res.status(504).send(JSON.stringify({ statusCode: 504, message: MSG_DESC[34] }, null, 2));
    })(req, res, next)
})

router.put('/data', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info && (info.status ? info.status >= 300 ? true : false : true)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user && (req.body = {...req.body, email: user.email})){
            passport.authenticate('updateTodo', { session: false }, (err, data, info) => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else if(info && (info.status ? info.status >= 300 ? true : false : false)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
                else if(data) return res.status(info.status).send(JSON.stringify({ statusCode: info.status, message: info.message }, null, 2))
                else return res.status(504).send(JSON.stringify({ statusCode: 504, message: MSG_DESC[34] }, null, 2));
            })(req, res, next)
        }else return res.status(504).send(JSON.stringify({ statusCode: 504, message: MSG_DESC[34] }, null, 2));
    })(req, res, next)
})

router.delete('/data', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
        else if(info) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
        else if(user && (req.body = {...req.body, email: user.email})){
            passport.authenticate('deleteTodo', { session: false }, (err, data, info) => {
                if(err) return res.status(500).send(JSON.stringify({statusCode: 500, message: MSG_DESC[0]}, null, 2));
                else if(info && (info.status ? info.status >= 300 ? true : false : false)) return res.status(info.status ? info.status : info.status = 400).send(JSON.stringify({statusCode: info.status, message: info.message}, null, 2));
                else if(data) return res.status(info.status).send(JSON.stringify({ statusCode: info.status, message: info.message }, null, 2))
                else return res.status(504).send(JSON.stringify({ statusCode: 504, message: MSG_DESC[34] }, null, 2));
            })(req, res, next)
        }else return res.status(504).send(JSON.stringify({ statusCode: 504, message: MSG_DESC[34] }, null, 2));
    })(req, res, next)
})

module.exports = router;