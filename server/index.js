const cors = require('cors');
const csrf = require('csurf');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

require('dotenv').config();
require('./lib/passport');

const app = express();
const status = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(csrf({
    cookie: {
        key: 'csrf-token',
        httpOnly: true,
        secure: status,
        sameSite: status ? 'none' : 'strict'
    }
}));
app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=UTF-8');
    res.cookie('xsrf-token', req.csrfToken(), {
        secure: status,
        sameSite: status ? 'none' : 'strict'
    }); next();
});
app.get('/status', (req, res) =>
    res.send(JSON.stringify({ status: 200, message: 'Server is up and running' }, null, 2))
)

const usersRouter = require('./routes/users.route');
const todoRouter = require('./routes/todo.route');
const oauthRouter = require('./routes/oauth.route');
app.use('/account/', usersRouter);
app.use('/todo/', todoRouter);
app.use('/oauth/', oauthRouter);

mongoose.connect(process.env.ATLAS_URI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true } );
mongoose.connection.once('open', () => console.log('MongoDB Database Extablished Successfully'))
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))