import { Router, Request, Response, NextFunction } from 'express';
import { ResponseCode } from '../../shared/response';
const Meeting = require('../../models/meeting');

const router = Router();

const errHandler = (err: any, res: Response) => {
  console.error(err);
  res.json({code: ResponseCode.ERROR});
};

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

export = router;
