const cors = require('cors');
const csrf = require('csurf');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
const status = process.env.NODE_ENV;
const PORT = process.env.PORT || 5000;

require('dotenv').config();
require('./lib/passport');

app.use(cors({
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(csrf({
    cookie: {
        key: 'csrf-token',
        httpOnly: true,
        secure: status === 'production',
        sameSite: status === 'production' ? 'none' : 'strict'
    }
}));
app.use((req, res, next) => {
    res.cookie('xsrf-token', req.csrfToken(), {
        secure: status === 'production',
        sameSite: status === 'production' ? 'none' : 'strict'
    });
    next();
});
app.get('/status', (req, res) => {
    res.json({
        statusCode: 200,
        message: 'Server is up and running'
    });
})

const usersRouter = require('./routes/users.route');
const todoRouter = require('./routes/todo.route');
const oauthRouter = require('./routes/oauth.route');
app.use('/account/', usersRouter);
app.use('/todo/', todoRouter);
app.use('/oauth/', oauthRouter);

const URI = process.env.ATLAS_URI;
mongoose.connect(URI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology:true } );
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB Database Extablished Successfully');
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});