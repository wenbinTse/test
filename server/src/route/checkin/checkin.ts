import { Router, Request, Response, NextFunction } from 'express';
import { checkObjectId } from '../../shared/middle-ware';
import { Weixin } from '../../weixin/weixin';
import { errHandler } from '../../shared/util';
import { Attendance } from '../../models/attendance';
import { Status, ResponseCode, AttendanceStatus } from '../../shared/interface';

const router = Router();
const Meeting = require('../../models/meeting');

router.get('/init/:id', checkObjectId, (req: Request, res: Response) => {
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

router.get('/:meetingId/:userId', (req: Request, res: Response) => {
  const meetingId = req.params.meetingId;
  const userId = req.params.userId;
  Attendance.findOne({meeting: meetingId, user: userId}, ['status', 'checkedIn']).exec()
    .then((doc: any) => {
      if (!doc) {
        res.json({code: ResponseCode.FIND_NOTHING});
        return;
      }
      if (doc.status !== AttendanceStatus.AUDITED) {
        res.json({
          code: ResponseCode.INCOMPLETE_INPUT,
          message: '您尚未同意或者已经拒绝了该用户的注册申请'
        });
        return;
      }
      if (doc.checkedIn) {
        res.json({
          code: ResponseCode.DUPLICATE_KEY,
          message: '已签到'
        });
        return;
      }
      Attendance.update({_id: doc._id}, {
        $set: {checkedIn: true}
      }).exec()
        .then(() => res.json({code: ResponseCode.SUCCESS}));
    })
      .catch((err: any) => errHandler(err, res));
});

export = router;
