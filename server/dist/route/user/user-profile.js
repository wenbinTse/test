"use strict";
const express_1 = require("express");
const interface_1 = require("../../shared/interface");
const util_1 = require("../../shared/util");
const middle_ware_1 = require("../../shared/middle-ware");
const file_1 = require("../../shared/file");
const urls_1 = require("../../shared/urls");
const attendance_1 = require("../../models/attendance");
const router = express_1.Router();
const User = require('../../models/user');
const Meeting = require('../../models/meeting');
const corporations = require('../../../data/corporation.json');
const titles = require('../../../data/title.json');
const format_cities = require('../../../data/format-cities.json');
router.get('/dataForProfile', middle_ware_1.checkLogin, (req, res) => {
    const session = req.session;
    const userId = session.user._id;
    User.findById(userId).exec()
        .then((user) => {
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            corporations,
            titles,
            cities: format_cities,
            item: Object.assign({}, user._doc, { profileImageSrc: urls_1.Urls.profileImage(user.profileImage) })
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/edit', middle_ware_1.checkLogin, (req, res) => {
    const session = req.session;
    const userId = session.user._id;
    const name = req.body.name;
    const gender = req.body.gender;
    const corporation = req.body.corporation;
    const title = req.body.title;
    const job = req.body.job;
    const location = req.body.location;
    if ((gender !== interface_1.Gender.FEMALE && gender !== interface_1.Gender.MALE) || !name || !corporation || !title) {
        res.json({
            code: interface_1.ResponseCode.INCOMPLETE_INPUT
        });
        return;
    }
    User.findByIdAndUpdate(userId, {
        $set: {
            name,
            gender,
            corporations,
            title,
            job,
            location
        }
    }).exec()
        .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/editProfileImage', (req, res) => {
    const session = req.session;
    const userId = session.user._id;
    file_1.default.upload(req, res, 'profileImage', (err, id) => {
        User.findByIdAndUpdate(userId, {
            $set: { profileImage: id }
        }).exec()
            .then(() => {
            res.json({
                code: interface_1.ResponseCode.SUCCESS,
                item: urls_1.Urls.profileImage(id)
            });
        })
            .catch((err) => util_1.errHandler(err, res));
    });
});
router.get('/meetings', (req, res) => {
    const session = req.session;
    const userId = session.user._id;
    attendance_1.Attendance.find({ user: userId })
        .sort({ createdDate: -1 })
        .populate('meeting')
        .exec()
        .then((docs) => {
        const pending = [];
        const refused = [];
        const audited = [];
        for (const doc of docs) {
            switch (doc.status) {
                case interface_1.AttendanceStatus.PENDING:
                    pending.push(doc);
                    break;
                case interface_1.AttendanceStatus.REFUSED:
                    refused.push(doc);
                    break;
                case interface_1.AttendanceStatus.AUDITED:
                    audited.push(doc);
                    break;
            }
        }
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            pending,
            refused,
            audited
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/cancelAttendance/:id', middle_ware_1.checkObjectId, (req, res) => {
    const session = req.session;
    const userId = session.user._id;
    const attenId = req.params.id;
    attendance_1.Attendance.findOne({ _id: attenId, user: userId }).exec()
        .then((atten) => {
        if (!atten) {
            res.json({ code: interface_1.ResponseCode.ACCESS_DENIED });
            return;
        }
        if (atten.status === interface_1.AttendanceStatus.AUDITED) {
            res.json({ code: interface_1.ResponseCode.INVALID_INPUT });
            return;
        }
        attendance_1.Attendance.remove({ _id: attenId }).exec()
            .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
            .catch((err) => util_1.errHandler(err, res));
    });
});
module.exports = router;
//# sourceMappingURL=user-profile.js.map