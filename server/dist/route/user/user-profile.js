"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express_1 = require("express");
const interface_1 = require("../../shared/interface");
const util_1 = require("../../shared/util");
const middle_ware_1 = require("../../shared/middle-ware");
const file_1 = require("../../shared/file");
const urls_1 = require("../../shared/urls");
const attendance_1 = require("../../models/attendance");
const user_1 = require("../../models/user");
const meeting_1 = require("../../models/meeting");
const router = express_1.Router();
const corporations = require('../../../data/corporation.json');
const titles = require('../../../data/title.json');
const format_cities = require('../../../data/format-cities.json');
router.get('/dataForProfile', middle_ware_1.checkLogin, (req, res) => {
    const session = req.session;
    const userId = session.user._id;
    user_1.User.findById(userId).exec()
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
    user_1.User.findByIdAndUpdate(userId, {
        $set: {
            name,
            gender,
            corporation,
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
        user_1.User.findByIdAndUpdate(userId, {
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
router.get('/currentUserInfo', (req, res) => {
    const session = req.session;
    if (!session || !session.user) {
        res.json({ code: interface_1.ResponseCode.UNLOGIN });
        return;
    }
    const user = session.user;
    user_1.User.findById(user._id, ['name', 'profileImage', 'email', 'userType', 'taxPayerId', 'invoiceTitle', 'phone']).exec()
        .then((doc) => __awaiter(this, void 0, void 0, function* () {
        if (!doc) {
            res.json({ code: interface_1.ResponseCode.ERROR });
            return;
        }
        const item = doc._doc;
        item.profileImageSrc = urls_1.Urls.profileImage(doc.profileImage);
        if (doc.userType === interface_1.UserType.MEETING_ADMIN) {
            yield meeting_1.Meeting.find({ owner: user._id, status: interface_1.Status.ACTIVE }, 'name').exec()
                .then((docs) => item.meetings = docs)
                .catch((err) => console.log(err));
        }
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            item
        });
    }));
});
module.exports = router;
//# sourceMappingURL=user-profile.js.map