import { Router, Request, Response } from 'express';
import { ResponseCode } from '../../shared/response';
const Meeting = require('../../models/meeting');

const router = Router();

const errHandler = (err: any, res: Response) => {
  console.error(err);
  res.json({code: ResponseCode.ERROR});
};

router.post('/add', (req: Request, res: Response) => {
  const name = req.body.name;
  const description = req.body.description;
  const startDate =  req.body.startDate;
  const endDate = req.body.endDate;
  const location = req.body.location;
  const guests = req.body.guests;
  const contacts = req.body.contacts;
  const meeting = new Meeting({
    name,
    description,
    startDate,
    endDate,
    location,
    guests,
    contacts,
  });
  meeting.save()
    .then((data: any) => res.json({
      code: ResponseCode.SUCCESS,
      meeting: data
    }))
    .catch((err: any) => errHandler(err, res));
});

export = router;
