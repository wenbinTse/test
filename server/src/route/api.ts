import { Router, Request, Response, NextFunction } from 'express';

const corporation = require('../../data/corporation.json');

const router = Router();

router.get('/corporation', (req: Request, res: Response) => {
  res.json({list: corporation});
});

const cities = require('../../data/cities.json');

interface Option {
  label: string;
  value: string;
  children?: Option[];
}

router.get('/cities', (req: Request, res: Response) => {
  const formatCities: Option[] = [];
  Object.keys(cities).map((key) => {
    const item: Option = {label: key, value: key, children: []};
    for (const city of cities[key]) {
      (item.children as Option[]).push({
        label: city,
        value: city
      });
    }
    formatCities.push(item);
  });
  res.json({list: formatCities});
});

const userRouter = require('./user/user');
const meetingRouter = require('./meeting/meeting');
const userAdminRouter = require('./user/user-admin');
const meetingAdminRouter = require('./meeting/meeting-admin');
const reviewRouter = require('./review/review');

router.use('/user', userRouter);
router.use('/user-admin', userAdminRouter);
router.use('/meeting', meetingRouter);
router.use('/meeting-admin', meetingAdminRouter);
router.use('/review', reviewRouter);

export = router;
