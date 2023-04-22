const cors = require('cors')
const csrf = require('csurf')
const helmet = require('helmet')
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')

const MSG_DESC = require('./lib/callback')

if (process.env.NODE_ENV !== 'production') require('dotenv').config()
require('./lib/passport')

const app = express()
const PORT = process.env.PORT || 5000
const status = process.env.NODE_ENV === 'production'

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.ATLAS_URI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }
}
        
app.use(cors({
    origin: (origin, cb) => {
        if(!origin || process.env.CLIENT_URL === "*" || process.env.CLIENT_URL.split(',').indexOf(origin) !== -1) cb(null, true)
        else cb(JSON.stringify({
            status: 401,
            message: 'Connnection has been blocked by CORS Policy: The origin header(s) is not equal to the supplied origin.'
        }, null, 2))
    },
    optionsSuccessStatus: 200,
    credentials: true
}))
app.use(helmet());
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(csrf({cookie: {
    key: 'csrf-token',
    httpOnly: true,
    secure: status,
    sameSite: status ? 'none' : 'strict'
}}))
app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=UTF-8')
    res.cookie('xsrf-token', req.csrfToken(), {
        secure: status,
        sameSite: status ? 'none' : 'strict'
    }); next();
})
app.use(new rateLimit({
    windowMs: 60000, // 1 minute
    max: 100,
    handler: (req, res) => res.status(429).send(JSON.stringify({status: 429, message: MSG_DESC[41]}, null, 2))
}))
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    return res.status(403).send(JSON.stringify({status: 403, message: MSG_DESC[40]}, null, 2))
})
app.get('/status', (req, res) => res.send(JSON.stringify({status: 200, message: 'Server is up and running'}, null, 2)))

const usersRouter = require('./routes/users.route')
const todoRouter = require('./routes/todo.route')
const oauthRouter = require('./routes/oauth.route')
app.use('/account', usersRouter)
app.use('/todo', todoRouter)
app.use('/oauth', oauthRouter)

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
})