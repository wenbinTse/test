import { Response } from 'express';
import { ResponseCode } from './interface';

export const errHandler = (err: any, res: Response, msg?: string) => {
  console.error(err);
  res.json({
    code: ResponseCode.ERROR,
    msg
  });
};
