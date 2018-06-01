"use strict";
const express_1 = require("express");
const interface_1 = require("../../shared/interface");
const util_1 = require("../../shared/util");
const middle_ware_1 = require("../../shared/middle-ware");
const urls_1 = require("../../shared/urls");
const file_1 = require("../../shared/file");
const attendance_1 = require("../../models/attendance");
const meeting_1 = require("../../models/meeting");
const user_1 = require("../../models/user");
const Email = require("../../shared/email");
const interface_2 = require("../../../../src/interface");
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
    const meeting = new meeting_1.Meeting({
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
router.post('/getUsers', (req, res) => {
    const field = req.body.field;
    const keyword = req.body.keyword;
    const condition = {
        userType: interface_2.UserType.ORDINARY
    };
    if (keyword) {
        condition[field] = keyword;
    }
    user_1.User.find(condition, 'name email corporation title job gender').limit(2000).exec()
        .then((docs) => res.json({ code: interface_1.ResponseCode.SUCCESS, list: docs }))
        .catch((err) => util_1.errHandler(err, res));
});
// 判断登录
router.use(middle_ware_1.checkLogin);
router.get('/dataForMeetingManage/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    meeting_1.Meeting.findOne({ _id: req.params.id, status: interface_1.Status.ACTIVE }).exec()
        .then((meeting) => {
        if (meeting) {
            res.json({
                code: interface_1.ResponseCode.SUCCESS,
                item: meeting,
                cities: format_cities
            });
        }
        else {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/edit/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
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
    meeting_1.Meeting.findOneAndUpdate({ _id: req.params.id, status: interface_1.Status.ACTIVE }, {
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
        .then((meeting) => {
        if (meeting) {
            res.json({ code: interface_1.ResponseCode.SUCCESS });
        }
        else {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/images/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    meeting_1.Meeting.findOne({ _id: req.params.id, status: interface_1.Status.ACTIVE }, ['images']).exec()
        .then((meeting) => {
        if (meeting) {
            res.json({
                code: interface_1.ResponseCode.SUCCESS,
                list: meeting.images.map((image) => urls_1.Urls.meetingImage(image)),
                ids: meeting.images
            });
        }
        else {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/deleteImage/:id/:imageId', middle_ware_1.checkMeetingAdmin, (req, res) => {
    const imageId = req.params.imageId;
    const meetingId = req.params.id;
    meeting_1.Meeting.findOneAndUpdate({ _id: meetingId, status: interface_1.Status.ACTIVE }, {
        $pull: {
            images: imageId
        }
    }).exec()
        .then((doc) => {
        if (!doc) {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
        else {
            if (doc.images.findIndex((value) => value === imageId) === -1) {
                res.json({ code: interface_1.ResponseCode.INVALID_INPUT });
            }
            else {
                file_1.default.delete(res, 'meetingImage', imageId, (err) => {
                    if (err) {
                        util_1.errHandler(err, res);
                    }
                    else {
                        res.json({ code: interface_1.ResponseCode.SUCCESS });
                    }
                });
            }
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/uploadImage/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    file_1.default.upload(req, res, 'meetingImage', (err, id) => {
        if (err) {
            util_1.errHandler(err, res);
            return;
        }
        meeting_1.Meeting.findOneAndUpdate({ _id: req.params.id, status: interface_1.Status.ACTIVE }, {
            $push: {
                images: id
            }
        }).exec()
            .then((doc) => {
            if (doc) {
                res.json({
                    code: interface_1.ResponseCode.SUCCESS,
                    item: urls_1.Urls.meetingImage(id),
                    id
                });
            }
            else {
                res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
            }
        })
            .catch((err) => util_1.errHandler(err, res));
    });
});
router.get('/files/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    meeting_1.Meeting.findOne({ _id: req.params.id, status: interface_1.Status.ACTIVE }, ['files']).exec()
        .then((meeting) => {
        if (meeting) {
            res.json({
                code: interface_1.ResponseCode.SUCCESS,
                list: meeting.files
            });
        }
        else {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/uploadFile/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    file_1.default.upload(req, res, 'file', (err, id) => {
        const file = req.files[0];
        const item = {
            id,
            name: file.originalname,
            fileType: file.contentType,
            size: file.size
        };
        meeting_1.Meeting.findOneAndUpdate({ _id: req.params.id, status: interface_1.Status.ACTIVE }, {
            $addToSet: {
                files: item
            }
        }).exec()
            .then((meeting) => {
            if (meeting) {
                res.json({
                    code: interface_1.ResponseCode.SUCCESS,
                    item,
                    id
                });
            }
            else {
                res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
            }
        })
            .catch((err) => util_1.errHandler(err, res));
    });
});
router.get('/deleteFile/:id/:fileId', middle_ware_1.checkMeetingAdmin, (req, res) => {
    const fileId = req.params.fileId;
    const meetingId = req.params.id;
    meeting_1.Meeting.findOneAndUpdate({ _id: meetingId, status: interface_1.Status.ACTIVE }, {
        $pull: {
            files: { id: fileId }
        }
    }).exec()
        .then((doc) => {
        if (!doc) {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
        else {
            if (doc.files.findIndex((value) => value === fileId) === -1) {
                res.json({ code: interface_1.ResponseCode.INVALID_INPUT });
            }
            else {
                file_1.default.delete(res, 'file', fileId, (err) => {
                    if (err) {
                        util_1.errHandler(err, res);
                    }
                    else {
                        res.json({ code: interface_1.ResponseCode.SUCCESS });
                    }
                });
            }
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/applicants/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
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
router.post('/auditAttendance/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    const meetingId = req.params.id;
    const attenIds = req.body.attenIds;
    if (!attenIds || !attenIds.length) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
    }
    attendance_1.Attendance.update({ _id: { $in: attenIds }, meeting: meetingId }, { $set: { status: interface_1.AttendanceStatus.AUDITED } }).exec()
        .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/refuseAttendance/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    const meetingId = req.params.id;
    const attenIds = req.body.attenIds;
    if (!attenIds || !attenIds.length) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
    }
    attendance_1.Attendance.update({ _id: { $in: attenIds }, meeting: meetingId }, { $set: { status: interface_1.AttendanceStatus.REFUSED } }).exec()
        .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/close/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    const meetingId = req.params.id;
    meeting_1.Meeting.findOneAndUpdate({ _id: meetingId, status: interface_1.Status.ACTIVE }, {
        $set: { status: interface_1.Status.DELETED }
    }).exec()
        .then((doc) => {
        if (doc) {
            res.json({ code: interface_1.ResponseCode.SUCCESS });
        }
        else {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/sendEmail/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    const addressees = req.body.addressees;
    meeting_1.Meeting.findById(req.params.id).exec()
        .then((doc) => {
        Email.promotion(addressees, doc, (err) => {
            if (err) {
                console.error(err);
                res.json({ code: interface_1.ResponseCode.ERROR });
            }
            else {
                res.json({ code: interface_1.ResponseCode.SUCCESS });
            }
        });
    });
});
module.exports = router;
//# sourceMappingURL=meeting-admin.js.map