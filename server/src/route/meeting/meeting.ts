import { Router, Request, Response, NextFunction } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import * as mongoose from 'mongoose';
import { checkObjectId } from '../../shared/middle-ware';

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

router.get('/:id', checkObjectId, (req: Request, res: Response) => {
  Meeting.findById(req.params.id).exec()
    .then((meeting: any) => {
      if (meeting) {
        res.json({
          code: ResponseCode.SUCCESS,
          item: meeting
        });
      } else {
        res.json({code: ResponseCode.FIND_NOTHING});
      }
    }).catch((err: any) => errHandler(err, res));
})

export = router;
