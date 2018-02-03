import { Router, Request, Response } from 'express';

const corporation = require('../../data/corporation.json');

const router = Router();

router.get('/corporation', (req: Request, res: Response) => {
  res.json({list: corporation});
});

const userRouter = require('./user/user');
const meetingRouter = require('./meeting/meeting');
const userAdminRouter = require('./user/user-admin');
const meetigAdminRouter = require('./meeting/meeting-admin');

router.use('/user', userRouter);
router.use('/user-admin', userAdminRouter);
router.use('/meeting', meetingRouter);
router.use('/meeting-admin', meetigAdminRouter);

export = router;
