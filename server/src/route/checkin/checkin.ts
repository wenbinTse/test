import { Router, Request, Response, NextFunction } from 'express';
import { checkObjectId } from '../../shared/middle-ware';
import { ResponseCode } from '../..//shared/interface';
import { Weixin } from '../../weixin/weixin';
import { errHandler } from '../../shared/util';

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

router.get('/checkIn/:meetingId/:userId', (req: Request, res: Response) => {

})

export = router;
