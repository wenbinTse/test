import { Router, Request, Response } from 'express';
import { Gender, Location, ResponseCode} from '../../shared/interface';
import { errHandler } from '../../shared/util';
import Pattern from '../../shared/pattern';
import Config from '../../shared/config';
import Session = Express.Session;
import {verifyPassword} from "../../shared/password";

const router = Router();
const User = require('../../models/user');

router.get('/:id', (req: Request, res: Response) => {
  User.findOne({_id: req.params.id}, ['name', 'createdDate']).exec()
    .then((data: any) => res.json({
      code: ResponseCode.SUCCESS,
      item: data
    }))
    .catch((err: any) => errHandler(err, res));
});

router.post('/register', (req: Request, res: Response) => {
  const name = req.body.name;
  const location = req.body.location as Location;
  const gender = req.body.gender as Gender;
  const password = req.body.password;
  const email = req.body.email;
  if (!name || !location.address || !location.city || !location.province || !gender
   || !password || !email) {
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
  const user = new User({
    name,
    location,
    gender
  });
  user.save()
    .then((data: any) => {
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
  User.findOne({email}).exec()
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
            item: doc
          });
        }
      });
    })
    .catch((err: any) => errHandler(err, res));
});

export = router;
