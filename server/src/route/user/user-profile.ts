import { Router, Request, Response } from 'express';
import { Location, Gender, ResponseCode, Status, AttendanceStatus, UserType } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import { checkLogin, checkObjectId } from '../../shared/middle-ware';
import Session = Express.Session;
import File from '../../shared/file';
import { Urls } from '../../shared/urls';
import { Attendance } from '../../models/attendance';
import { User } from '../../models/user';
import { Meeting } from '../../models/meeting';

const router = Router();

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
      corporation,
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

router.get('/meetings', (req: Request, res: Response) => {
  const session = req.session as Session;
  const userId = session.user._id;
  Attendance.find({user: userId})
    .sort({createdDate: -1})
    .populate('meeting')
    .exec()
    .then((docs: any[]) => {
      const pending: any[] = [];
      const refused: any[] = [];
      const audited: any[] = [];
      for (const doc of docs) {
        switch (doc.status) {
          case AttendanceStatus.PENDING:
            pending.push(doc);
            break;
          case AttendanceStatus.REFUSED:
            refused.push(doc);
            break;
          case AttendanceStatus.AUDITED:
            audited.push(doc);
            break;
        }
      }
      res.json({
        code: ResponseCode.SUCCESS,
        pending,
        refused,
        audited
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/cancelAttendance/:id', checkObjectId, (req: Request, res: Response) => {
  const session = req.session as Session;
  const userId = session.user._id;
  const attenId = req.params.id;
  Attendance.findOne({_id: attenId, user: userId}).exec()
    .then((atten: any) => {
      if (!atten) {
        res.json({code: ResponseCode.ACCESS_DENIED});
        return;
      }
      if (atten.status === AttendanceStatus.AUDITED) {
        res.json({code: ResponseCode.INVALID_INPUT});
        return;
      }
      Attendance.remove({_id: attenId}).exec()
        .then(() => res.json({code: ResponseCode.SUCCESS}))
        .catch((err: any) => errHandler(err, res));
    });
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
      const item: any = doc._doc;
      item.profileImageSrc = Urls.profileImage(doc.profileImage);
      if (doc.userType === UserType.MEETING_ADMIN) {
        await Meeting.find({owner: user._id, status: Status.ACTIVE}, 'name').exec()
          .then((docs: any[]) => item.meetings = docs)
          .catch((err: any) => console.log(err));
      }
      res.json({
        code: ResponseCode.SUCCESS,
        item
      });
    });
});

export = router;
