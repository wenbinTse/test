import { Router, Request, Response } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import { checkLogin, checkObjectId } from '../../shared/middle-ware';
import Session = Express.Session;

const router = Router();
const Review = require('../../models/review');
const User = require('../../models/user');

router.get('/getReviews/:id', checkObjectId, (req: Request, res: Response) => {
  const meetingId = req.params.id;
  Review.find({meeting: meetingId})
    .sort({createdDate: -1})
    .populate('owner', ['name', '_id', 'profileImage'])
    .exec()
    .then((data: any[]) => {
      res.json({
        code: ResponseCode.SUCCESS,
        list: data
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/getReplies/:id', checkObjectId, (req: Request, res: Response) => {
  const reviewId = req.params.id;
  Review.find({replyTo: reviewId})
    .populate('owner', ['name', '_id', 'profileImage'])
    .exec()
    .then((data: any) => {
      res.json({
        code: ResponseCode.SUCCESS,
        list: data
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/add', checkLogin, (req: Request, res: Response) => {
  const type = req.body.type;
  const content = req.body.content;
  const meetingId = req.body.meetingId;
  const replyTo = req.body.replyTo;

  const userId = (req.session as Session).user._id;
  const name = (req.session as Session).user.name;

  const newReview: any = {
    content,
    owner: userId
  };

  if (type === 'review') {
    if (!meetingId) {
      res.json({code: ResponseCode.INCOMPLETE_INPUT});
      return;
    }
    newReview.meeting = meetingId;
  } else if (type === 'reply') {
    if (!replyTo) {
      res.json({code: ResponseCode.INCOMPLETE_INPUT});
      return;
    }
    newReview.replyTo = replyTo;
  } else {
    res.json({code: ResponseCode.INVALID_INPUT});
    return;
  }
  new Review(newReview).save()
    .then((review: any) => {
      const item = review._doc;
      item.owner = {
        name,
        _id: userId
      };
      res.json({
        code: ResponseCode.SUCCESS,
        item
      });
      if (type === 'reply') {
        Review.update({_id: replyTo}, {$inc: {numOfReply: 1}})
          .catch((err: any) => console.error(err));
      }
    })
    .catch((err: any) => errHandler(err, res));
});

export = router;
