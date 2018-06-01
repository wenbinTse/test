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
const middle_ware_1 = require("../../shared/middle-ware");
const util_1 = require("../../shared/util");
const interface_1 = require("../../shared/interface");
const user_1 = require("../../models/user");
const password_1 = require("../../shared/password");
const meeting_1 = require("../../models/meeting");
const featured_meeting_1 = require("../../models/featured-meeting");
const router = express_1.Router();
router.post('/addMeetingManager', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !name || !password) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    const newUser = new user_1.User({
        name,
        email,
        password: password_1.createHashAndSalt(password),
        userType: interface_1.UserType.MEETING_ADMIN
    });
    newUser.save()
        .then((doc) => res.json({
        code: interface_1.ResponseCode.SUCCESS,
        item: { _id: doc._id, name: doc.name, email: doc.email }
    }))
        .catch((err) => {
        console.error(err);
        if (err.code === interface_1.ResponseCode.DUPLICATE_KEY) {
            res.json({ code: interface_1.ResponseCode.DUPLICATE_KEY });
        }
        else {
            res.json({ code: interface_1.ResponseCode.ERROR });
        }
    });
});
router.post('/getUsers', (req, res) => {
    const type = req.body.userType;
    user_1.User.find({ userType: type, status: { $ne: interface_1.Status.DELETED } }).exec()
        .then((docs) => {
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            list: docs
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
const fields = 'name startDate endDate owner';
router.get('/meetings', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let meetings;
    yield meeting_1.Meeting.find({ status: interface_1.Status.ACTIVE }, fields)
        .populate('owner', 'name')
        .exec()
        .then((docs) => meetings = docs)
        .catch((err) => util_1.errHandler(err, res));
    featured_meeting_1.FeaturedMeeting.find({}, fields)
        .populate('owner', 'name')
        .exec()
        .then((docs) => {
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            meetings,
            featuredMeetings: docs
        });
    })
        .catch((err) => util_1.errHandler(err, res));
}));
router.get('/deleteUser/:id', middle_ware_1.checkObjectId, (req, res) => {
    const id = req.params.id;
    user_1.User.update({ _id: id }, { $set: {
            status: interface_1.Status.DELETED
        } })
        .exec()
        .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }))
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/addFeaturedMeeting/:id', middle_ware_1.checkObjectId, (req, res) => {
    const meeting = new featured_meeting_1.FeaturedMeeting({
        meeting: req.params.id
    });
    const user = req.session;
    meeting.save().then((doc) => res.json({
        code: interface_1.ResponseCode.SUCCESS,
        item: {
            _id: doc._id,
            startDate: doc.startDate,
            endDate: doc.endDate,
            owner: { name:  }
        }
    }))
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/deleteFeaturedMeeting/:id', middle_ware_1.checkObjectId, (req, res) => {
    featured_meeting_1.FeaturedMeeting.findByIdAndRemove(req.params.id).exec()
        .then((doc) => {
        if (doc) {
            res.json({ code: interface_1.ResponseCode.SUCCESS });
        }
        else {
            res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        }
    }).catch((err) => util_1.errHandler(err, res));
});
module.exports = router;
//# sourceMappingURL=admin.js.map