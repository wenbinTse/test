import { Router, Request, Response } from 'express';
import { Location, Gender, ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import { checkLogin } from '../../shared/middle-ware';
import Session = Express.Session;
import File from '../../shared/file';
import { Urls } from '../../shared/urls';

const router = Router();
const User = require('../../models/user');

const corporations = require('../../../data/corporation.json');
const titles = require('../../../data/title.json');
const format_cities = require('../../../data/format-cities.json');

router.get('/dataForProfile', checkLogin, (req: Request, res: Response) => {
  const session = req.session as Session;
  const userId = session.user._id;
  User.findById(userId).exec()
    .then((user: any) => {
      res.json({
        code: ResponseCode.SUCCESS,
        corporations,
        titles,
        cities: format_cities,
        item: {
          ...user._doc,
          profileImageSrc: Urls.profileImage(user.profileImage)
        }
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/edit', checkLogin, (req: Request, res: Response) => {
  const session = req.session as Session;
  const userId = session.user._id;
  const name = req.body.name;
  const gender = req.body.gender as Gender;
  const corporation = req.body.corporation;
  const title = req.body.title;
  const job = req.body.job;
  const location = req.body.location as Location;
  if ((gender !== Gender.FEMALE && gender !== Gender.MALE) || !name || !corporation || !title) {
    res.json({
      code: ResponseCode.INCOMPLETE_INPUT
    });
    return;
  }
  User.findByIdAndUpdate(userId, {
    $set: {
      name,
      gender,
      corporations,
      title,
      job,
      location
    }
  }).exec()
    .then(() => res.json({code: ResponseCode.SUCCESS}))
    .catch((err: any) => errHandler(err, res));
});

router.post('/editProfileImage', (req: Request, res: Response) => {
  const session = req.session as Session;
  const userId = session.user._id;
  File.upload(req, res, 'profileImage', (err, id) => {
    User.findByIdAndUpdate(userId, {
      $set: {profileImage: id}
    }).exec()
    .then(() => {
      res.json({
        code: ResponseCode.SUCCESS,
        item: Urls.profileImage(id)
      });
    })
    .catch((err: any) => errHandler(err, res));
  });
});

export = router;
