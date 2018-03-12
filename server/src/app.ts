import * as express from 'express';
import { Response, Request, NextFunction, RequestHandler } from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import Config from './shared/config';
import * as mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import { Weixin } from './weixin/weixin';

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const dbUrl = Config.dbUrl;

(<any>mongoose).Promise = global.Promise;
mongoose.connect(dbUrl, (err: MongoError) => {
  if (err) {
    console.error('DB CONNECTION FAILED: ' + err);
  } else {
    console.log('DB CONNECTION SUCCESS: ' + dbUrl);
  }
});

Weixin.init();

const app = express();
const api = require('./route/api');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: '_secret_',
  cookie: {maxAge: Config.sessionMaxAge},
  saveUninitialized: false,
  resave: true,
  rolling: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

const ALLOW_ORIGINS: string[] = [Config.domain, 'http://buaa.free.ngrok.cc', 'undefined', 'http://c68051d2.ngrok.io'];

// Allow all requests that reaches express to make API calls.
app.use((req: Request, res: Response, next: NextFunction) => {
  // if (!req.headers.origin || ALLOW_ORIGINS.indexOf(req.headers.origin as string) >= 0 ) {
  //   res.header('Access-Control-Allow-Origin', req.headers.origin as string);
  //   res.header('Access-Control-Allow-Credentials', 'true');
  //   res.header('Access-Control-Allow-Headers', 'Content-Type');
  //   next();
  // } else {
  //   res.sendStatus(402);
  // }
    res.header('Access-Control-Allow-Origin', req.headers.origin as string);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/', express.static(path.join(__dirname, '/../../build')));

app.get('*', function (request: Request, response: Response, next: NextFunction) {
  const url: string = request.url;
  if (url.startsWith('/api')) {
    next();
    return;
  }
  response.sendFile(path.join(__dirname, '/../../build/index.html'));
});

app.use('/api', api);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error('Not Found');
  err.status = 404; // TODO(bowen): err.status is not found on type Error
  next(err);
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err.message === 'Not Found') {
    res.sendStatus(404);
  } else {
    res.status(500);
  }
});

process.on('SIGINT', function() {
  // mongoose.disconnect();
});

process.on('uncaughtException', (err: Error) => {
  if (err.message)
    console.error(err);
});

process.on('unhandledRejection', (err: Error, promise: any) => {
  console.error(err);
  console.error(promise);
});

module.exports = app;
