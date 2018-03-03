import { Router, Request, Response } from 'express';
import { ResponseCode } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import Session = Express.Session;
import { checkObjectId, checkLogin } from '../../shared/middle-ware';
import { Urls } from '../../shared/urls';
import File from '../../shared/file';

const Meeting = require('../../models/meeting');
const router = Router();
const format_cities = require('../../../data/format-cities.json');

router.post('/create', (req: Request, res: Response) => {
  const name = req.body.name;
  const description = req.body.description;
  const detail = req.body.detail;
  const startDate =  req.body.startDate;
  const endDate = req.body.endDate;
  const location = req.body.location;
  const guests = req.body.guests;
  const owner = (req.session as Session).user._id;
  const meeting = new Meeting({
    owner,
    name,
    description,
    detail,
    startDate,
    endDate,
    location,
    guests
  });
  meeting.save()
    .then((data: any) => res.json({
      code: ResponseCode.SUCCESS,
      item: data
    }))
    .catch((err: any) => errHandler(err, res));
});

router.get('/dataForMeetingManage/:id', checkObjectId, (req: Request, res: Response) => {
  Meeting.findById(req.params.id).exec()
    .then((meeting: any) => {
      res.json({
        code: ResponseCode.SUCCESS,
        item: meeting,
        cities: format_cities
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/edit/:id', checkObjectId, (req: Request, res: Response) => {
  const name = req.body.name;
  const description = req.body.description;
  const detail = req.body.detail;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const location = req.body.location;
  const guests =  req.body.guests;
  Meeting.findByIdAndUpdate(req.params.id, {
    $set: {
      name,
      description,
      detail,
      startDate,
      endDate,
      location,
      guests
    }
  }).exec()
    .then(() => {
      res.json({code: ResponseCode.SUCCESS});
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/images/:id', checkObjectId, (req: Request, res: Response) => {
  Meeting.findById(req.params.id, ['images']).exec()
    .then((meeting: any) => {
      res.json({
        code: ResponseCode.SUCCESS,
        list: meeting.images.map((image: string) => Urls.meetingImage(image)),
        ids: meeting.images
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/deleteImage/:meetingId/:imageId', (req: Request, res: Response) => {
  const imageId = req.params.imageId;
  File.delete(res, 'meetingImage', imageId, (err: any) => {
    if (err) {
      errHandler(err, res);
      return;
    }
    Meeting.update({_id: req.params.meetingId}, {
      $pull: {
        images: imageId
      }
    }).exec()
      .then(() => res.json({code: ResponseCode.SUCCESS}))
      .catch((err: any) => errHandler(err, res));
  });
});

router.post('/uploadImage/:id', checkObjectId, (req: Request, res: Response) => {
  File.upload(req, res, 'meetingImage', (err: any, id: string) => {
    if (err) {
      errHandler(err, res);
      return;
    }
    Meeting.findByIdAndUpdate(req.params.id, {
      $push: {
        images: id
      }
    }).exec()
      .then(() => res.json({
        code: ResponseCode.SUCCESS,
        item: Urls.meetingImage(id),
        id
      }))
      .catch((err: any) => errHandler(err, res));
  });
});

router.get('/files/:id', checkObjectId, (req: Request, res: Response) => {
  Meeting.findById(req.params.id, ['files']).exec()
    .then((meeting: any) => {
      res.json({
        code: ResponseCode.SUCCESS,
        list: meeting.files
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/uploadFile/:id', checkObjectId, (req: Request, res: Response) => {
  File.upload(req, res, 'file', (err: any, id: string) => {
    const file = (req.files as Express.Multer.File[])[0];
    const item = {
      id,
      name: file.originalname,
      fileType: file.contentType,
      size: file.size
    };
    Meeting.findByIdAndUpdate(req.params.id, {
      $addToSet: {
        files: item
      }
    }).exec()
      .then(() => res.json({
        code: ResponseCode.SUCCESS,
        item,
        id
      }))
      .catch((err: any) => errHandler(err, res));
  });
});

router.get('/deleteFile/:meetingId/:fileId', (req: Request, res: Response) => {
  const fileId = req.params.fileId;
  File.delete(res, 'file', fileId, (err: any) => {
    if (err) {
      errHandler(err, res);
      return;
    }
    Meeting.update({_id: req.params.meetingId}, {
      $pull: {
        files: {id: fileId}
      }
    }).exec()
      .then(() => res.json({code: ResponseCode.SUCCESS}))
      .catch((err: any) => errHandler(err, res));
  });
});

export = router;
