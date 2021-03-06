import { Router, Request, Response, NextFunction } from 'express';
import { checkObjectId, checkLogin, checkMeetingAdmin } from '../../shared/middle-ware';
import { Weixin } from '../../weixin/weixin';
import { errHandler } from '../../shared/util';
import { Attendance } from '../../models/attendance';
import { Status, ResponseCode, AttendanceStatus } from '../../shared/interface';
import * as mongoose from 'mongoose';
import { Meeting } from '../../models/meeting';

const router = Router();

router.use(checkLogin);

router.get('/init/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  console.log(req.headers);
  const url = req.headers.referer as string;
  Meeting.findById(req.params.id, ['name', 'startDate', 'endDate']).exec()
    .then((doc: any) => {
      if (doc) {
        res.json({
          code: ResponseCode.SUCCESS,
          meeting: doc,
          wx: Weixin.getSignature(url)
        });
      } else {
        res.json({code: ResponseCode.FIND_NOTHING});
      }
    }).catch((err: any) => errHandler(err, res));
});

router.get('/:id/:userId', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  const meetingId = req.params.id;
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.json({
      code: ResponseCode.FIND_NOTHING
    });
    return;
  }
  Attendance.findOne({meeting: meetingId, user: userId}, ['status', 'checkedIn']).exec()
    .then((doc: any) => {
      if (!doc) {
        console.error(1)
        res.json({code: ResponseCode.FIND_NOTHING});
        return;
      }
      if (doc.status !== AttendanceStatus.AUDITED) {
        console.error(2)
        res.json({
          code: ResponseCode.INCOMPLETE_INPUT,
          message: '您尚未同意或者已经拒绝了该用户的注册申请'
        });
        return;
      }
      if (doc.checkedIn) {
        console.error(3)
        res.json({
          code: ResponseCode.DUPLICATE_KEY,
          message: '已签到'
        });
        return;
      }
      Attendance.findByIdAndUpdate({_id: doc._id}, {
        $set: {checkedIn: true}
      })
      .populate('user', 'name email gender corporation title job profileImage')
      .exec()
      .then((doc: any) => {
        console.log(4)
        res.json({
          code: ResponseCode.SUCCESS,
          item: doc
        });
      });
    })
      .catch((err: any) => errHandler(err, res));
});

export = router;
