import { Router, Request, Response, NextFunction } from 'express';
import { checkObjectId } from '../../shared/middle-ware';
import { Weixin } from '../../weixin/weixin';
import { errHandler } from '../../shared/util';
import { Attendance } from '../../models/attendance';
import { Status, ResponseCode, AttendanceStatus, UserType } from '../../shared/interface';
import { User } from '../../models/user';
import { createHashAndSalt } from '../../shared/password';
import { Meeting } from '../../models/meeting';

const router = Router();

router.post('/addMeetingManager', (req: Request, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !name || !password) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
    return;
  }
  const newUser = new User({
    name,
    email,
    password: createHashAndSalt(password),
    userType: UserType.MEETING_ADMIN
  });
  newUser.save()
    .then((doc: any) => res.json({
      code: ResponseCode.SUCCESS,
      item: doc
    }))
    .catch((err: any) => {
      console.error(err);
      if (err.code === ResponseCode.DUPLICATE_KEY) {
        res.json({code: ResponseCode.DUPLICATE_KEY});
      } else {
        res.json({code: ResponseCode.ERROR});
      }
    });
});

router.post('/getUsers', (req: Request, res: Response) => {
  const type = req.body.userType;
  User.find({userType: type, status: {$ne: Status.DELETED}}).exec()
    .then((docs: any[]) => {
      res.json({
        code: ResponseCode.SUCCESS,
        list: docs
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/meetings', (req: Request, res: Response) => {
  Meeting.find({status: {$ne: Status.DELETED}}, 'name startDate endDate owner')
    .populate('owner', 'name')
    .exec()
    .then((docs: any[]) => res.json({
      code: ResponseCode.SUCCESS,
      list: docs
    }))
    .catch((err: any) => errHandler(err, res));
});

router.get('/deleteUser/:id', checkObjectId, (req: Request, res: Response) => {
  const id = req.params.id;
  User.update({_id: id}, {$set: {
    status: Status.DELETED
  }})
    .exec()
    .then(() => res.json({code: ResponseCode.SUCCESS}))
    .catch((err: any) => errHandler(err, res));
});

export = router;
