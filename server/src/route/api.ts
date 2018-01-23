import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/hello', (req: Request, res: Response) => {
  res.send('hello');
});

const meetingRouter = require('./meeting/meeting');
const meetingAdminRouter = require('./meeting/meeting-admin');

router.use('/meeting', meetingRouter);
router.use('/meeting-admin', meetingAdminRouter);

export = router;
