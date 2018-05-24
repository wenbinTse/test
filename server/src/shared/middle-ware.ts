import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ResponseCode, UserType } from './interface';
import { Meeting } from '../models/meeting';
import * as mongoose from 'mongoose';
import Session = Express.Session;

export const checkObjectId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    res.json({code: ResponseCode.FIND_NOTHING});
  }
  else {
    next();
  }
};

export const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as Session;
  if (!session || !session.user) {
    res.json({code: ResponseCode.UNLOGIN});
  } else {
    next();
  }
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as Session;
  const user =  session.user;
  if (user.userType !== UserType.ADMIN) {
    res.json({code: ResponseCode.ACCESS_DENIED});
  } else {
    next();
  }
};

export const checkMeetingAdmin = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as Session;
  const user = session.user;
  Meeting.findById(req.params.id, 'owner').exec()
  .then((doc: any) => {
    if (doc.owner.toString() !== user._id.toString()) {
      res.json({code: ResponseCode.ACCESS_DENIED});
    } else {
      next();
    }
  });
};
