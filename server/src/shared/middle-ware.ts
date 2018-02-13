import { Request, Response, NextFunction } from 'express';
import { ResponseCode } from './interface';
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
}
