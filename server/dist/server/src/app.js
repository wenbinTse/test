"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const config_1 = require("./shared/config");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const dbUrl = config_1.default.dbUrl;
mongoose.Promise = global.Promise;
mongoose.connect(dbUrl, (err) => {
    if (err) {
        console.error('DB CONNECTION FAILED: ' + err);
    }
    else {
        console.log('DB CONNECTION SUCCESS: ' + dbUrl);
    }
});
const app = express();
const api = require('./route/api');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: '_secret_',
    cookie: { maxAge: config_1.default.sessionMaxAge },
    saveUninitialized: false,
    resave: true,
    rolling: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
const ALLOW_ORIGIN = config_1.default.domain;
// Allow all requests that reaches express to make API calls.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use('/', express.static(path.join(__dirname, '/../../build')));
app.get('*', function (request, response, next) {
    const url = request.url;
    if (url.startsWith('/api')) {
        next();
        return;
    }
    response.sendFile(path.join(__dirname, '/../../build/index.html'));
});
app.use('/api', api);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404; // TODO(bowen): err.status is not found on type Error
    next(err);
});
// error handler
app.use((err, req, res, next) => {
    console.error(err);
    if (err.message === 'Not Found') {
        res.sendStatus(404);
    }
    else {
        res.status(500);
    }
});
process.on('SIGINT', function () {
    // mongoose.disconnect();
});
process.on('uncaughtException', (err) => {
    if (err.message)
        console.error(err);
});
process.on('unhandledRejection', (err, promise) => {
    console.error(err);
    console.error(promise);
});
module.exports = app;
//# sourceMappingURL=app.js.map