var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}
var usersRouter = require('./routes/users');
var appsRouter = require('./routes/apps')
var authRouter = require('./routes/auth')
var app = express();

app.use(allowCrossDomain)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', usersRouter);
app.use('/apps', appsRouter);
app.use('/auth', authRouter);
module.exports = app;
