import { Router, Request, Response, NextFunction } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler} from '../../shared/util';

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

export = router;
