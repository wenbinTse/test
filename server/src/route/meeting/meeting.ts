import { Router, Request, Response, NextFunction } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import * as mongoose from 'mongoose';
import { checkObjectId } from '../../shared/middle-ware';
import { Urls } from '../../shared/urls';

const Meeting = require('../../models/meeting');
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

export = router;
