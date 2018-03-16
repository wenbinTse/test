import { Router, Request, Response } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import { checkLogin, checkObjectId } from '../../shared/middle-ware';
import Session = Express.Session;
import { Urls } from '../../shared/urls';
import { Review } from '../../models/review';
import { Meeting } from '../../models/meeting';

const router = Router();

function getReviews(condition: Object, res: Response) {
   Review.find(condition)
    .sort({createdDate: -1})
    .populate('owner', ['name', '_id', 'profileImage'])
    .exec()
    .then((data: any[]) => {
      const list: any[] = [];
      for (const item of data) {
        const newItem = item.toObject();
        newItem.profileImageSrc = Urls.profileImage(newItem.owner.profileImage);
        list.push(newItem);
      }
      res.json({
        code: ResponseCode.SUCCESS,
        list
      });
    })
    .catch((err: any) => errHandler(err, res));
}

router.get('/getReviews/:id', checkObjectId, (req: Request, res: Response) => {
  const meetingId = req.params.id;
  getReviews({meeting: meetingId}, res);
});

router.get('/getReplies/:id', checkObjectId, (req: Request, res: Response) => {
  const reviewId = req.params.id;
  getReviews({replyTo: reviewId}, res);
});

router.post('/add', checkLogin, async (req: Request, res: Response) => {
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

  if (!meetingId) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
    return;
  }


  if (type === 'review') {
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

  await Meeting.findOne({_id: meetingId, owner: userId}, ['_id']).exec()
    .then((data: any) => {
      if (data) {
        newReview.admin = true;
      }
    });

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
