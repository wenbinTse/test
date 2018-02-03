import { Router, Request, Response } from 'express';
import { Gender, Location, ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import Pattern from '../../shared/pattern';
import Config from '../../shared/config';
import Session = Express.Session;
import { createHashAndSalt, verifyPassword } from '../../shared/password';
import * as Email from '../../shared/email';

const crypto = require('crypto');
const router = Router();
const User = require('../../models/user');

const corporations = require('../../../data/corporation.json');
const titles = require('../../../data/title.json');

router.get('/dataForRegister', (req: Request, res: Response) => {
  res.json({
    code: ResponseCode.SUCCESS,
    corporations,
    titles
  });
});

router.post('/register', (req: Request, res: Response) => {
  const name = req.body.name;
  const gender = req.body.gender as Gender;
  const password = req.body.password;
  const email = req.body.email;
  const corporation = req.body.corporation;
  const title = req.body.title;
  const job = req.body.job;
  if (!name || !gender || !corporation
   || !password || !email || !title) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
    return;
  }
  if (!Pattern.email.test(email)) {
    res.json({
      code: ResponseCode.INVALID_INPUT,
      msg: 'invalid email'
    });
    return;
  }
  if (password.length < Config.passwordMinLength) {
    res.json({
      code: ResponseCode.INVALID_INPUT,
      message: 'Passwords must be at least ' + Config.passwordMinLength + ' characters in length'
    });
    return;
  }

  const hash = crypto.randomBytes(12).toString('hex');

  const user = new User({
    name,
    gender,
    password: createHashAndSalt(password),
    email,
    title,
    job,
    hashForValidation: hash,
    validated: false
  });
  user.save()
    .then((data: any) => {
      Email.register({name, email, _id: data._id}, hash);
      res.json({
        code: ResponseCode.SUCCESS,
        item: data
      });
      const session: Session = req.session as Session;
      session.user = data;
    })
    .catch((err: any) => {
      console.error(err);
      if (err.code === ResponseCode.DUPLICATE_KEY) {
        res.json({
          code: ResponseCode.DUPLICATE_KEY,
          key: 'email'
        });
      } else {
        res.json({code: ResponseCode.ERROR});
      }
    });
});

router.post('/login', (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
    return;
  }
  User.findOne({email}, ['_id', 'email', 'userType', 'profileImage', 'password', 'name']).exec()
    .then((doc: any) => {
      if (!doc || !verifyPassword(password, doc.password.salt, doc.password.hash)) {
        res.json({
          code: ResponseCode.INCORRECT_USERNAME_OR_PASSWORD,
        });
      }
      const session: Session = req.session as Session;
      session.user = doc;
      session.save((err) => {
        if (err) {
          console.error(err);
        } else {
          res.json({
            code: ResponseCode.SUCCESS,
            item: {
              _id: doc._id,
              email: doc.email,
              userType: doc.userType,
              profileImage: doc.profileImage
            }
          });
        }
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err: Error) => {
      if (err) {
        errHandler(err, res);
        return;
      }
      res.clearCookie('connect.sid', { path: '/' });
      res.json({code: ResponseCode.SUCCESS});
    });
  }
});

router.get('/currentUserInfo', (req: Request, res: Response) => {
  const session = req.session as Session;
  if (!session || !session.user) {
    res.json({code: ResponseCode.UNLOGIN});
    return;
  }
  const user = session.user;
  res.json({
    code: ResponseCode.SUCCESS,
    item: {
      name: user.name,
      profileImage: user.profileImage,
      email: user.email,
      _id: user._id
    }
  });
});

router.get('/verify/:userId/:hash', (req: Request, res: Response) => {
  const _id = req.params.userId;
  User.findById(_id, ['hashForValidation']).exec()
    .then((user: any) => {
      if (user.hashForValidation === req.params.hash) {
        User.update({_id }, {$set: {validated: true}}).exec()
          .then(() => {
            res.json({code: ResponseCode.SUCCESS});
          });
      } else {
        res.json({code: ResponseCode.INVALID_INPUT});
      }
    })
    .catch((err: any) => errHandler(err, res));
})

router.get('/:id', (req: Request, res: Response) => {
  User.findOne({_id: req.params.id}, ['name', 'createdDate']).exec()
    .then((data: any) => res.json({
      code: ResponseCode.SUCCESS,
      item: data
    }))
    .catch((err: any) => errHandler(err, res));
});

export = router;
