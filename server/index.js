const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const passport = require('./passport/setup');
const app = express();

require('dotenv').config();
require('./passport/setup');

const port = process.env.PORT || 5000;

const URI = process.env.ATLAS_URI;
mongoose.connect(URI, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology:true } );
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB Database Extablished Successfully');
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(
    session({
        secret: 'helloworld',
        resave: false,
        saveUninitialized: true,
        store: new mongoStore({ mongooseConnection: mongoose.connection })
    })
)

app.use(passport.initialize());
app.use(passport.session())

const usersRouter = require('./routes/users.routes');
const todoRouter = require('./routes/todo.routes');
app.use('/data/accounts/', usersRouter);
app.use('/data/todo/', todoRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});