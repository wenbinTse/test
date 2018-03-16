import { Router, Request, Response } from 'express';
import { Location, Gender, ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import { User } from '../../models/user';

const router = Router();

router.post('/add', (req: Request, res: Response) => {
  const name = req.body.name;
  const location = req.body.location as Location;
  const gender = req.body.gender as Gender;
  if (!name || !location.address || !location.city || !location.province || !gender) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
    return;
  }
  const user = new User({
    name,
    location,
    gender
  });
  user.save()
    .then((data: any) => res.json({
      code: ResponseCode.SUCCESS,
      item: data
    }))
    .catch((err: any) => errHandler(err, res));
});

export = router;
