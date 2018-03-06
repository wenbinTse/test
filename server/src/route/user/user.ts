import { Router, Request, Response } from 'express';
import { Gender, Location, ResponseCode, UserType } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import Pattern from '../../shared/pattern';
import Config from '../../shared/config';
import Session = Express.Session;
import { createHashAndSalt, verifyPassword } from '../../shared/password';
import * as Email from '../../shared/email';
import { Urls } from '../../shared/urls';
import { profileImage } from '../../../../src/components/profile/profile.css';

const crypto = require('crypto');
const router = Router();
const User = require('../../models/user');
const Meeting = require('../../models/meeting');

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
    corporation,
    title,
    job,
    hashForValidation: hash,
    validated: false
  });
  user.save()
    .then((data: any) => {
      Email.welcome({name, email, _id: data._id}, hash);
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
        return;
      }
      const session: Session = req.session as Session;
      session.user = doc;
      session.save(async (err) => {
        if (err) {
          res.json({code: ResponseCode.ERROR});
          console.error(err);
          return;
        }
        const item: any = {
            _id: doc._id,
            email: doc.email,
            userType: doc.userType,
            profileImage: doc.profileImage,
            profileImageSrc: Urls.profileImage(doc.profileImage)
        };
        res.json({
          code: ResponseCode.SUCCESS,
          item
        });
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
  User.findById(user._id, ['name', 'profileImage', 'email', 'userType', 'taxPayerId', 'invoiceTitle', 'phone']).exec()
    .then(async (doc: any) => {
      if (!doc) {
        res.json({code: ResponseCode.ERROR});
        return;
      }
      const item: any = {
        name: doc.name,
        profileImage: doc.profileImage,
        profileImageSrc: Urls.profileImage(doc.profileImage),
        email: doc.email,
        _id: doc._id,
        meetings: [],
        taxPayerId: doc.taxPayerId,
        phone: doc.phone,
        invoiceTitle: doc.invoiceTitle
      };
      if (doc.userType === UserType.MEETING_ADMIN) {
        await Meeting.find({owner: user._id}, 'name').exec()
          .then((docs: any[]) => item.meetings = docs)
          .catch((err: any) => console.log(err));
      }
      res.json({
        code: ResponseCode.SUCCESS,
        item
      });
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
});

router.get('/sendVerificationCode/:email', (req: Request, res: Response) => {
  const email = req.params.email;
  User.findOne({email: email}, ['verificationCode', 'name']).exec()
    .then((user: any) => {

        if (!user) {
          res.json({
            code: ResponseCode.UNREGISTERED,
            message: 'the mailbox has not been registered yet'
          });
          return;
        }

        if (user.verificationCode) {
          const lastSendTime: number = user.verificationCode.sendTime.getTime();
          const now: number = new Date().getTime();
          if (now - lastSendTime < 60 * 1000) {
            res.json({
              code: ResponseCode.TOO_OFTEN,
              message: 'send just one time each minute'
            });
            return;
          }
        }

        const code = Math.random().toString(10).substring(2, 8);
        const verificationCode = {
          code: code,
          sendTime: new Date()
        };

        User.update({email: email}, {$set: {verificationCode: verificationCode}}).exec()
          .then(() => {
            Email.verificationCode({name: user.name, email}, code);
            res.json({code: ResponseCode.SUCCESS});
          });
      })
    .catch((err: any) => errHandler(err, res));
});

const verifyCode = (verificationCode: {code: string, sendTime: Date}, code: string) => {
  if (!verificationCode) {
    return false;
  }
  if (new Date().getTime() - verificationCode.sendTime.getTime() > 5 * 60 * 1000) {
    return false;
  }
  if (verificationCode.code !== code) {
    return false;
  }
  return true;
};

router.post('/resetPassword', (req: Request, res: Response) => {
  const email = req.body.email;
  const code = req.body.code;
  const password = req.body.password;
  if (!email || !code || !password) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
    return;
  }
  User.findOne({email}, ['verificationCode', 'name', '_id']).exec()
    .then((user: any) => {
      if (!verifyCode(user.verificationCode, code)) {
        res.json({code: ResponseCode.INVALID_INPUT});
        return;
      }
      const hash = crypto.randomBytes(12).toString('hex');
      User.update(
        {email},
        {$set: {
          password: createHashAndSalt(password),
          hashForValidation: hash,
          validated: false
        }})
        .exec()
        .then(() => {
          res.json({code: ResponseCode.SUCCESS});
          Email.welcome({email, name: user.name, _id: user._id}, hash);
        });
    });
});

router.get('/:id', (req: Request, res: Response) => {
  User.findOne({_id: req.params.id}, ['name', 'createdDate']).exec()
    .then((data: any) => res.json({
      code: ResponseCode.SUCCESS,
      item: data
    }))
    .catch((err: any) => errHandler(err, res));
});

export = router;
