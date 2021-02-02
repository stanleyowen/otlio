const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const app = express();

require('dotenv').config();

const passport = require('./passport');
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
        secret: process.env.SECRET_SESSION,
        resave: false,
        saveUninitialized: true,
        store: new mongoStore({ mongooseConnection: mongoose.connection })
    })
)
app.use(passport.initialize());
app.use(passport.session());

const usersRouter = require('./routes/users.route');
const todoRouter = require('./routes/todo.route');
app.use('/data/accounts/', usersRouter);
app.use('/data/todo/', todoRouter);

const URI = process.env.ATLAS_URI;
mongoose.connect(URI, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology:true } );
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB Database Extablished Successfully');
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});