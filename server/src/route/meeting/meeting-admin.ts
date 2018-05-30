import { Router, Request, Response } from 'express';
import { ResponseCode, AttendanceStatus, Status, Addressee, UserType } from '../../shared/interface';
import { errHandler } from '../../shared/util';
import Session = Express.Session;
import { checkObjectId, checkLogin, checkMeetingAdmin } from '../../shared/middle-ware';
import { Urls } from '../../shared/urls';
import File from '../../shared/file';
import { Attendance } from '../../models/attendance';
import { Meeting } from '../../models/meeting';
import { User } from '../../models/user';
import { images } from '../../../../src/components/meeting-manage/meeting-manage.css';
import * as Email from '../../shared/email';

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
  const stayTypes = req.body.stayTypes;

  if (!name || !startDate || !endDate || !location || !location.province || !location.city
    || !location.address) {
      res.json({code: ResponseCode.INCOMPLETE_INPUT});
      return;
    }

  const owner = (req.session as Session).user._id;
  const meeting = new Meeting({
    owner,
    name,
    description,
    detail,
    startDate,
    endDate,
    location,
    guests,
    stayTypes
  });
  meeting.save()
    .then((data: any) => res.json({
      code: ResponseCode.SUCCESS,
      item: data
    }))
    .catch((err: any) => errHandler(err, res));
});

router.post('/getUsers', (req: Request, res: Response) => {
  const field = req.body.field;
  const keyword = req.body.keyword;
  const condition: any = {
    userType: UserType.ORDINARY
  };
  if (keyword) {
    condition[field] = keyword;
  }
  User.find(condition, 'name email corporation title job gender').limit(2000).exec()
  .then((docs: any[]) => res.json({code: ResponseCode.SUCCESS, list: docs}))
  .catch((err: any) => errHandler(err, res));
});

// 判断登录
router.use(checkLogin);

router.get('/dataForMeetingManage/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  Meeting.findOne({_id: req.params.id, status: Status.ACTIVE}).exec()
    .then((meeting: any) => {
      if (meeting) {
        res.json({
          code: ResponseCode.SUCCESS,
          item: meeting,
          cities: format_cities
        });
      } else {
        res.json({code: ResponseCode.FIND_NOTHING});
      }
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/edit/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  const name = req.body.name;
  const description = req.body.description;
  const detail = req.body.detail;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const location = req.body.location;
  const guests =  req.body.guests;
  const stayTypes = req.body.stayTypes;

  if (!name || !startDate || !endDate || !location || !location.province || !location.city
    || !location.address || !stayTypes) {
      res.json({code: ResponseCode.INCOMPLETE_INPUT});
      return;
    }

  Meeting.findOneAndUpdate({_id: req.params.id, status: Status.ACTIVE}, {
    $set: {
      name,
      description,
      detail,
      startDate,
      endDate,
      location,
      guests,
      stayTypes
    }
  }).exec()
    .then((meeting: any) => {
      if (meeting) {
        res.json({code: ResponseCode.SUCCESS});
      } else {
        res.json({code: ResponseCode.FIND_NOTHING});
      }
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/images/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  Meeting.findOne({_id: req.params.id, status: Status.ACTIVE}, ['images']).exec()
    .then((meeting: any) => {
      if (meeting) {
        res.json({
          code: ResponseCode.SUCCESS,
          list: meeting.images.map((image: string) => Urls.meetingImage(image)),
          ids: meeting.images
        });
      } else {
        res.json({code: ResponseCode.FIND_NOTHING});
      }
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/deleteImage/:id/:imageId', checkMeetingAdmin, (req: Request, res: Response) => {
  const imageId = req.params.imageId;
  const meetingId = req.params.id;
  Meeting.findOneAndUpdate({_id: meetingId, status: Status.ACTIVE}, {
    $pull: {
      images: imageId
    }
  }).exec()
    .then((doc: any) => {
      if (!doc) {
        res.json({code: ResponseCode.FIND_NOTHING});
      } else {
        if (doc.images.findIndex((value: string) => value === imageId) === -1) {
          res.json({code: ResponseCode.INVALID_INPUT});
        } else {
          File.delete(res, 'meetingImage', imageId, (err: any) => {
            if (err) {
              errHandler(err, res);
            } else {
              res.json({code: ResponseCode.SUCCESS});
            }
          });
        }
      }
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/uploadImage/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  File.upload(req, res, 'meetingImage', (err: any, id: string) => {
    if (err) {
      errHandler(err, res);
      return;
    }
    Meeting.findOneAndUpdate({_id: req.params.id, status: Status.ACTIVE}, {
      $push: {
        images: id
      }
    }).exec()
      .then((doc: any) => {
        if (doc) {
          res.json({
            code: ResponseCode.SUCCESS,
            item: Urls.meetingImage(id),
            id
          });
        } else {
          res.json({code: ResponseCode.FIND_NOTHING});
        }
      })
      .catch((err: any) => errHandler(err, res));
  });
});

router.get('/files/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  Meeting.findOne({_id: req.params.id, status: Status.ACTIVE}, ['files']).exec()
    .then((meeting: any) => {
      if (meeting) {
        res.json({
          code: ResponseCode.SUCCESS,
          list: meeting.files
        });
      } else {
        res.json({code: ResponseCode.FIND_NOTHING});
      }
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/uploadFile/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  File.upload(req, res, 'file', (err: any, id: string) => {
    const file = (req.files as Express.Multer.File[])[0];
    const item = {
      id,
      name: file.originalname,
      fileType: file.contentType,
      size: file.size
    };
    Meeting.findOneAndUpdate({_id: req.params.id, status: Status.ACTIVE}, {
      $addToSet: {
        files: item
      }
    }).exec()
      .then((meeting: any) => {
        if (meeting) {
          res.json({
            code: ResponseCode.SUCCESS,
            item,
            id
          });
        } else {
          res.json({code: ResponseCode.FIND_NOTHING});
        }
      })
      .catch((err: any) => errHandler(err, res));
  });
});

router.get('/deleteFile/:id/:fileId', checkMeetingAdmin, (req: Request, res: Response) => {
  const fileId = req.params.fileId;
  const meetingId = req.params.id;
  Meeting.findOneAndUpdate({_id: meetingId, status: Status.ACTIVE}, {
    $pull: {
      files: {id: fileId}
    }
  }).exec()
    .then((doc: any) => {
      if (!doc) {
        res.json({code: ResponseCode.FIND_NOTHING});
      } else {
        if (doc.files.findIndex((value: string) => value === fileId) === -1) {
          res.json({code: ResponseCode.INVALID_INPUT});
        } else {
          File.delete(res, 'file', fileId, (err: any) => {
            if (err) {
              errHandler(err, res);
            } else {
              res.json({code: ResponseCode.SUCCESS});
            }
          });
        }
      }
    })
    .catch((err: any) => errHandler(err, res));
});

router.get('/applicants/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  Attendance.find({meeting: req.params.id})
    .sort({createdDate: -1})
    .populate('user', 'name email gender corporation title job profileImage')
    .exec()
    .then((docs: any[]) => {
      const pending: any[] = [];
      const audited: any[] = [];
      for (const doc of docs) {
        switch (doc.status) {
          case AttendanceStatus.PENDING:
            pending.push(doc);
            break;
          case AttendanceStatus.AUDITED:
            audited.push(doc);
            break;
        }
      }
      res.json({
        code: ResponseCode.SUCCESS,
        pending,
        audited
      });
    })
    .catch((err: any) => errHandler(err, res));
});

router.post('/auditAttendance/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  const meetingId = req.params.id;
  const attenIds: string[] = req.body.attenIds;
  if (!attenIds || !attenIds.length) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
  }
  Attendance.update(
    {_id: {$in: attenIds}, meeting: meetingId},
    {$set: {status: AttendanceStatus.AUDITED}}
  ).exec()
    .then(() => res.json({code: ResponseCode.SUCCESS}))
    .catch((err: any) => errHandler(err, res));
});

router.post('/refuseAttendance/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  const meetingId = req.params.id;
  const attenIds: string[] = req.body.attenIds;
  if (!attenIds || !attenIds.length) {
    res.json({code: ResponseCode.INCOMPLETE_INPUT});
  }
  Attendance.update(
    {_id: {$in: attenIds}, meeting: meetingId},
    {$set: {status: AttendanceStatus.REFUSED}}
  ).exec()
    .then(() => res.json({code: ResponseCode.SUCCESS}))
    .catch((err: any) => errHandler(err, res));
});

router.get('/close/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  const meetingId = req.params.id;
  Meeting.findOneAndUpdate({_id: meetingId, status: Status.ACTIVE}, {
    $set: {status: Status.DELETED}
  }).exec()
  .then((doc) => {
    if (doc) {
      res.json({code: ResponseCode.SUCCESS});
    } else {
      res.json({code: ResponseCode.FIND_NOTHING});
    }
  })
  .catch((err: any) => errHandler(err, res));
});

router.post('/sendEmail/:id', checkObjectId, checkMeetingAdmin, (req: Request, res: Response) => {
  const addressees = req.body.addressees;
  Meeting.findById(req.params.id).exec()
  .then((doc) => {
    Email.promotion(addressees, doc, (err) => {
      if (err) {
        console.error(err);
        res.json({code: ResponseCode.ERROR});
      } else {
        res.json({code: ResponseCode.SUCCESS});
      }
    });
  });
});

export = router;
