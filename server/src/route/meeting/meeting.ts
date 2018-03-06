import { Router, Request, Response, NextFunction } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import * as mongoose from 'mongoose';
import { checkObjectId, checkLogin } from '../../shared/middle-ware';
import { Urls } from '../../shared/urls';
import Session = Express.Session;

const Meeting = require('../../models/meeting');
const Attendance = require('../../models/attendance');
const User = require('../../models/user');
const router = Router();

router.get('/list', (req: Request, res: Response) => {
  Meeting.find({})
    .exec()
    .then((data: any[]) =>
      res.json({
        code: ResponseCode.SUCCESS,
        list: data
      }))
    .catch((err: any) => errHandler(err, res));
});

router.post('/search', (req: Request, res: Response) => {
  const keyword = req.body.keyword;
  const reg: RegExp = new RegExp(keyword, 'i');
  const condition = {
    $or: [
      {name: {$regex: reg}},
      {description: {$regex: reg}},
      {detail: {$regex: reg}}
    ]
  };
  Meeting.find(condition).exec()
    .then((meetings: any[]) => {
      const newList: any[] = [];
      for (const item of meetings) {
        const newItem = item._doc;
        newItem.images = item.images.map((image: string) => Urls.meetingImage(image));
        newList.push(newItem);
      }
      res.json({
        code: ResponseCode.SUCCESS,
        list: newList
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/:id', checkObjectId, (req: Request, res: Response) => {
  Meeting.findById(req.params.id).exec()
    .then((meeting: any) => {
      if (meeting) {
        const newItem = meeting._doc;
        newItem.images = meeting.images.map((image: string) => Urls.meetingImage(image));
        res.json({
          code: ResponseCode.SUCCESS,
          item: newItem
        });
      } else {
        res.json({code: ResponseCode.FIND_NOTHING});
      }
    }).catch((err: any) => errHandler(err, res));
});

router.post('/register', checkLogin, async (req: Request, res: Response) => {
  const meetingId = req.body.meetingId;
  const taxPayerId = req.body.taxPayerId;
  const invoiceTitle = req.body.invoiceTitle;
  const phone = req.body.phone;
  const forecastArriveTime = req.body.forecastArriveTime;
  const stayType = req.body.stayType;
  const stayDates = req.body.stayDates;
  const remarks = req.body.remarks;
  const userId = (req.session as Session).user._id;

  if (!meetingId || !taxPayerId || !invoiceTitle || !phone) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
    return;
  }

  let invalid = false;
  await Meeting.findById(meetingId, ['startDate', 'endDate']).exec()
   .then((meeting: any) => {
    if (!meeting) {
      res.json({code: ResponseCode.FIND_NOTHING});
      invalid = true;
    }
  });
  if (invalid) {
    return;
  }

  const attendance = new Attendance({
    meeting: meetingId,
    user: userId,
    taxPayerId,
    invoiceTitle,
    phone,
    forecastArriveTime,
    stayType,
    stayDates,
    remarks
  });
  attendance.save()
    .then((data: any) => {
      res.json({code: ResponseCode.SUCCESS});
      const userId = (req.session as Session).user._id;
      User.update({_id: userId}, {$set: {
        taxPayerId,
        invoiceTitle,
        phone
      }}).catch((err: any) => console.log(err));
    })
    .catch((err: any) => {
      console.error(err);
      if (err.code === ResponseCode.DUPLICATE_KEY) {
        res.json({code: ResponseCode.DUPLICATE_KEY});
      } else {
        res.json({code: ResponseCode.ERROR});
      }
    });
});

export = router;
