const express = require('express');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();
require('./config/passport');

app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());

const usersRouter = require('./routes/users.route');
const todoRouter = require('./routes/todo.route');
const statusRouter = require('./routes/status.route');
const oauthRouter = require('./routes/oauth.route');
app.use('/data/accounts/', usersRouter);
app.use('/data/todo/', todoRouter);
app.use('/oauth/', oauthRouter);
app.use('/', statusRouter);

const URI = process.env.ATLAS_URI;
mongoose.connect(URI, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology:true } );
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB Database Extablished Successfully');
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});