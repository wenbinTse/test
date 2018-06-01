"use strict";
const express_1 = require("express");
const middle_ware_1 = require("../../shared/middle-ware");
const weixin_1 = require("../../weixin/weixin");
const util_1 = require("../../shared/util");
const attendance_1 = require("../../models/attendance");
const interface_1 = require("../../shared/interface");
const mongoose = require("mongoose");
const meeting_1 = require("../../models/meeting");
const router = express_1.Router();
router.use(middle_ware_1.checkLogin);
router.get('/init/:id', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    console.log(req.headers);
    const url = req.headers.referer;
    meeting_1.Meeting.findById(req.params.id, ['name', 'startDate', 'endDate']).exec()
        .then((doc) => {
        if (doc) {
            res.json({
                code: interface_1.ResponseCode.SUCCESS,
                meeting: doc,
                wx: weixin_1.Weixin.getSignature(url)
            });
        }
        else {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
        }
    }).catch((err) => util_1.errHandler(err, res));
});
router.get('/:id/:userId', middle_ware_1.checkObjectId, middle_ware_1.checkMeetingAdmin, (req, res) => {
    const meetingId = req.params.id;
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(meetingId) || !mongoose.Types.ObjectId.isValid(userId)) {
        res.json({
            code: interface_1.ResponseCode.FIND_NOTHING
        });
        return;
    }
    attendance_1.Attendance.findOne({ meeting: meetingId, user: userId }, ['status', 'checkedIn']).exec()
        .then((doc) => {
        if (!doc) {
            res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
            return;
        }
        if (doc.status !== interface_1.AttendanceStatus.AUDITED) {
            res.json({
                code: interface_1.ResponseCode.INCOMPLETE_INPUT,
                message: '您尚未同意或者已经拒绝了该用户的注册申请'
            });
            return;
        }
        if (doc.checkedIn) {
            res.json({
                code: interface_1.ResponseCode.DUPLICATE_KEY,
                message: '已签到'
            });
            return;
        }
        attendance_1.Attendance.findByIdAndUpdate({ _id: doc._id }, {
            $set: { checkedIn: true }
        })
            .populate('user', 'name email gender corporation title job profileImage')
            .exec()
            .then((doc) => res.json({
            code: interface_1.ResponseCode.SUCCESS,
            item: doc
        }));
    })
        .catch((err) => util_1.errHandler(err, res));
});
module.exports = router;
//# sourceMappingURL=checkin.js.map