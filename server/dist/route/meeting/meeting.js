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
const urls_1 = require("../../shared/urls");
const attendance_1 = require("../../models/attendance");
const meeting_1 = require("../../models/meeting");
const user_1 = require("../../models/user");
const Email = require("../../shared/email");
const router = express_1.Router();
router.get('/list', (req, res) => {
    meeting_1.Meeting.find({ status: interface_1.Status.ACTIVE })
        .exec()
        .then((data) => res.json({
        code: interface_1.ResponseCode.SUCCESS,
        list: data
    }))
        .catch((err) => util_1.errHandler(err, res));
});
router.post('/search', (req, res) => {
    const keyword = req.body.keyword;
    const reg = new RegExp(keyword, 'i');
    const condition = {
        status: interface_1.Status.ACTIVE,
        $or: [
            { name: { $regex: reg } },
            { description: { $regex: reg } },
            { detail: { $regex: reg } }
        ]
    };
    meeting_1.Meeting.find(condition).exec()
        .then((meetings) => {
        const newList = [];
        for (const item of meetings) {
            const newItem = item._doc;
            newItem.images = item.images.map((image) => urls_1.Urls.meetingImage(image));
            newList.push(newItem);
        }
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            list: newList
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/:id', middle_ware_1.checkObjectId, (req, res) => {
    meeting_1.Meeting.findOne({ _id: req.params.id, status: interface_1.Status.ACTIVE }).exec()
        .then((meeting) => {
        if (meeting) {
            const newItem = meeting._doc;
            newItem.images = meeting.images.map((image) => urls_1.Urls.meetingImage(image));
            res.json({
                code: interface_1.ResponseCode.SUCCESS,
                item: newItem
            });
        }
        else {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
    }).catch((err) => util_1.errHandler(err, res));
});
router.post('/register', middle_ware_1.checkLogin, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const meetingId = req.body.meetingId;
    const taxPayerId = req.body.taxPayerId;
    const invoiceTitle = req.body.invoiceTitle;
    const phone = req.body.phone;
    const forecastArriveTime = req.body.forecastArriveTime;
    const stayType = req.body.stayType;
    const stayDates = req.body.stayDates;
    const remarks = req.body.remarks;
    const session = req.session;
    const userId = session.user._id;
    const userName = session.user.name;
    const email = session.user.email;
    if (!meetingId || !taxPayerId || !invoiceTitle || !phone) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    let meeting;
    yield meeting_1.Meeting.findById(meetingId, ['startDate', 'endDate', 'name']).exec()
        .then((doc) => {
        meeting = doc;
    });
    if (!meeting) {
        res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        return;
    }
    const attendance = new attendance_1.Attendance({
        meeting: meetingId,
        user: userId,
        taxPayerId,
        invoiceTitle,
        phone,
        forecastArriveTime,
        stayType,
        stayDates,
        remarks
    });
    attendance.save()
        .then((data) => {
        res.json({ code: interface_1.ResponseCode.SUCCESS });
        Email.registerMeeting({ name: userName, email }, meeting); // 发送邮件
        const userId = req.session.user._id;
        user_1.User.update({ _id: userId }, { $set: {
                taxPayerId,
                invoiceTitle,
                phone
            } }).catch((err) => console.log(err));
    })
        .catch((err) => {
        console.error(err);
        if (err.code === interface_1.ResponseCode.DUPLICATE_KEY) {
            res.json({ code: interface_1.ResponseCode.DUPLICATE_KEY });
        }
        else {
            res.json({ code: interface_1.ResponseCode.ERROR });
        }
    });
}));
module.exports = router;
//# sourceMappingURL=meeting.js.map