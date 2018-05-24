import { Router, Request, Response, NextFunction } from 'express';
import { ResponseCode, Status, Gender } from '../shared/interface';
import { errHandler } from '../shared/util';
import { Urls } from '../shared/urls';
import { Meeting } from '../models/meeting';
import { FeaturedMeeting } from '../models/featured-meeting';

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

import { User } from '../models/user';
import { createHashAndSalt } from '../shared/password';
import { checkAdmin, checkLogin } from '../shared/middle-ware';

const titles = ['教授', '副教授', '讲师', '学生', '其他'];
const corporations = ['清华大学', '北京大学', '北京航空航天大学', '复旦大学', '其他'];
const jobs = ['计算机学院院长', '校长', '党委数据', '计算机学院党委书记', ''];

router.get('/createusers', async (req: Request, res: Response) => {
  for (let i = 0; i < 100; i++) {
    const user = new User({
      name: 'test_' + i,
      email: `test__${i}@test.com`,
      password: createHashAndSalt('xiewenbin'),
      gender: Math.floor(Math.random() * 2) === 1 ? Gender.FEMALE : Gender.MALE,
      title: titles[Math.floor(Math.random() * 5)],
      corporation: corporations[Math.floor(Math.random() * 5)],
      job: jobs[Math.floor(Math.random() * 5)]
    });
    await user.save().then(() => console.log(i))
              .catch((err: any) => console.log(err));
  }
  res.json({code: ResponseCode.SUCCESS});
});

const userRouter = require('./user/user');
const meetingRouter = require('./meeting/meeting');
const meetingAdminRouter = require('./meeting/meeting-admin');
const reviewRouter = require('./review/review');
const userProfileRouter = require('./user/user-profile');
const fileRouter = require('./file/file');
const checkInRouter = require('./checkin/checkin');
const adminRouter = require('./admin/admin');

router.use('/user', userRouter);
router.use('/meeting', meetingRouter);
router.use('/meetingAdmin', meetingAdminRouter);
router.use('/review', reviewRouter);
router.use('/profile', userProfileRouter);
router.use('/file', fileRouter);
router.use('/checkIn', checkInRouter);
router.use('/admin', checkLogin, checkAdmin, adminRouter);

export = router;
