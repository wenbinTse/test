"use strict";
const express_1 = require("express");
const interface_1 = require("../../shared/interface");
const util_1 = require("../../shared/util");
const middle_ware_1 = require("../../shared/middle-ware");
const urls_1 = require("../../shared/urls");
const file_1 = require("../../shared/file");
const attendance_1 = require("../../models/attendance");
const Meeting = require('../../models/meeting');
const router = express_1.Router();
const format_cities = require('../../../data/format-cities.json');
router.post('/create', (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const detail = req.body.detail;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const location = req.body.location;
    const guests = req.body.guests;
    const stayTypes = req.body.stayTypes;
    if (!name || !startDate || !endDate || !location || !location.province || !location.city
        || !location.address || !stayTypes) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    const owner = req.session.user._id;
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
        .then((data) => res.json({
        code: interface_1.ResponseCode.SUCCESS,
        item: data
    }))
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/dataForMeetingManage/:id', middle_ware_1.checkObjectId, (req, res) => {
    Meeting.findById(req.params.id).exec()
        .then((meeting) => {
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            item: meeting,
            cities: format_cities
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/edit/:id', middle_ware_1.checkObjectId, (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const detail = req.body.detail;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const location = req.body.location;
    const guests = req.body.guests;
    const stayTypes = req.body.stayTypes;
    if (!name || !startDate || !endDate || !location || !location.province || !location.city
        || !location.address || !stayTypes) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    Meeting.findByIdAndUpdate(req.params.id, {
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
        .then(() => {
        res.json({ code: interface_1.ResponseCode.SUCCESS });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/images/:id', middle_ware_1.checkObjectId, (req, res) => {
    Meeting.findById(req.params.id, ['images']).exec()
        .then((meeting) => {
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            list: meeting.images.map((image) => urls_1.Urls.meetingImage(image)),
            ids: meeting.images
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/deleteImage/:meetingId/:imageId', (req, res) => {
    const imageId = req.params.imageId;
    file_1.default.delete(res, 'meetingImage', imageId, (err) => {
        if (err) {
            util_1.errHandler(err, res);
            return;
        }
        Meeting.update({ _id: req.params.meetingId }, {
            $pull: {
                images: imageId
            }
        }).exec()
            .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
            .catch((err) => util_1.errHandler(err, res));
    });
});
router.post('/uploadImage/:id', middle_ware_1.checkObjectId, (req, res) => {
    file_1.default.upload(req, res, 'meetingImage', (err, id) => {
        if (err) {
            util_1.errHandler(err, res);
            return;
        }
        Meeting.findByIdAndUpdate(req.params.id, {
            $push: {
                images: id
            }
        }).exec()
            .then(() => res.json({
            code: interface_1.ResponseCode.SUCCESS,
            item: urls_1.Urls.meetingImage(id),
            id
        }))
            .catch((err) => util_1.errHandler(err, res));
    });
});
router.get('/files/:id', middle_ware_1.checkObjectId, (req, res) => {
    Meeting.findById(req.params.id, ['files']).exec()
        .then((meeting) => {
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            list: meeting.files
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/uploadFile/:id', middle_ware_1.checkObjectId, (req, res) => {
    file_1.default.upload(req, res, 'file', (err, id) => {
        const file = req.files[0];
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
            code: interface_1.ResponseCode.SUCCESS,
            item,
            id
        }))
            .catch((err) => util_1.errHandler(err, res));
    });
});
router.get('/deleteFile/:meetingId/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    file_1.default.delete(res, 'file', fileId, (err) => {
        if (err) {
            util_1.errHandler(err, res);
            return;
        }
        Meeting.update({ _id: req.params.meetingId }, {
            $pull: {
                files: { id: fileId }
            }
        }).exec()
            .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
            .catch((err) => util_1.errHandler(err, res));
    });
});
router.get('/applicants/:id', middle_ware_1.checkObjectId, (req, res) => {
    attendance_1.Attendance.find({ meeting: req.params.id })
        .sort({ createdDate: -1 })
        .populate('user', 'name email gender corporation title job profileImage')
        .exec()
        .then((docs) => {
        const pending = [];
        const audited = [];
        for (const doc of docs) {
            switch (doc.status) {
                case interface_1.AttendanceStatus.PENDING:
                    pending.push(doc);
                    break;
                case interface_1.AttendanceStatus.AUDITED:
                    audited.push(doc);
                    break;
            }
        }
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            pending,
            audited
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('auditAttendance/:id', middle_ware_1.checkObjectId, (req, res) => {
    const meetingId = req.params.id;
    const attenIds = req.body.attenIds;
    if (!attenIds || !attenIds.length) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
    }
    attendance_1.Attendance.update({ _id: { $in: attenIds }, meeting: meetingId }, { $set: { status: interface_1.AttendanceStatus.AUDITED } }).exec()
        .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
        .catch((err) => util_1.errHandler(err, res));
});
router.post('refuseAttendance/:id', middle_ware_1.checkObjectId, (req, res) => {
    const meetingId = req.params.id;
    const attenIds = req.body.attenIds;
    if (!attenIds || !attenIds.length) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
    }
    attendance_1.Attendance.update({ _id: { $in: attenIds }, meeting: meetingId }, { $set: { status: interface_1.AttendanceStatus.REFUSED } }).exec()
        .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
        .catch((err) => util_1.errHandler(err, res));
});
module.exports = router;
//# sourceMappingURL=meeting-admin.js.map