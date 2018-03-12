import { Router, Request, Response, NextFunction } from 'express';
import { ResponseCode, Status } from '../shared/interface';
import { errHandler } from '../shared/util';
import { Urls } from '../shared/urls';

const corporation = require('../../data/corporation.json');
const router = Router();
const Meeting = require('../models/meeting');
const FeaturedMeeting = require('../models/featured-meeting');

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

router.get('/dataForHome', (req: Request, res: Response) => {
  let meetings: any[];
  Meeting.find({status: {$ne: Status.DELETED}})
    .exec()
    .then((data: any[]) => {
      const list: any[] = [];
      for (const item of data) {
        const newItem = item._doc;
        newItem.images = item.images.map((image: string) => Urls.meetingImage(image));
        list.push(newItem);
      }
      meetings = list;
      return FeaturedMeeting.find({}).populate('meeting', ['images', 'name']).exec();
    })
    .then((docs: any[]) => {
      const list = docs.map((doc) => doc.meeting);
      const newList: any[] = [];
      for (const item of list) {
        const newItem = item._doc;
        newItem.images = item.images.map((image: string) => Urls.meetingImage(image));
        newList.push(newItem);
      }
      res.json({
        code: ResponseCode.SUCCESS,
        meetings,
        featuredMeetings: newList
      });
    })
    .catch((err: any) => errHandler(err, res));
});

const userRouter = require('./user/user');
const meetingRouter = require('./meeting/meeting');
const userAdminRouter = require('./user/user-admin');
const meetingAdminRouter = require('./meeting/meeting-admin');
const reviewRouter = require('./review/review');
const userProfileRouter = require('./user/user-profile');
const fileRouter = require('./file/file');
const checkInRouter = require('./checkin/checkin');

router.use('/user', userRouter);
router.use('/user-admin', userAdminRouter);
router.use('/meeting', meetingRouter);
router.use('/meeting-admin', meetingAdminRouter);
router.use('/review', reviewRouter);
router.use('/profile', userProfileRouter);
router.use('/file', fileRouter);
router.use('/checkIn', checkInRouter);

export = router;
