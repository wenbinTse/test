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
const review_1 = require("../../models/review");
const meeting_1 = require("../../models/meeting");
const router = express_1.Router();
function getReviews(condition, res) {
    review_1.Review.find(condition)
        .sort({ createdDate: -1 })
        .populate('owner', ['name', '_id', 'profileImage'])
        .exec()
        .then((data) => {
        const list = [];
        for (const item of data) {
            const newItem = item.toObject();
            newItem.profileImageSrc = urls_1.Urls.profileImage(newItem.owner.profileImage);
            list.push(newItem);
        }
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            list
        });
    })
        .catch((err) => util_1.errHandler(err, res));
}
router.get('/getReviews/:id', middle_ware_1.checkObjectId, (req, res) => {
    const meetingId = req.params.id;
    getReviews({ meeting: meetingId }, res);
});
router.get('/getReplies/:id', middle_ware_1.checkObjectId, (req, res) => {
    const reviewId = req.params.id;
    getReviews({ replyTo: reviewId }, res);
});
// 下方路由需要登录
router.use(middle_ware_1.checkLogin);
router.post('/add', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const type = req.body.type;
    const content = req.body.content;
    const meetingId = req.body.meetingId;
    const replyTo = req.body.replyTo;
    const userId = req.session.user._id;
    const name = req.session.user.name;
    const newReview = {
        content,
        owner: userId
    };
    if (!meetingId) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    if (type === 'review') {
        newReview.meeting = meetingId;
    }
    else if (type === 'reply') {
        if (!replyTo) {
            res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
            return;
        }
        newReview.replyTo = replyTo;
    }
    else {
        res.json({ code: interface_1.ResponseCode.INVALID_INPUT });
        return;
    }
    yield meeting_1.Meeting.findOne({ _id: meetingId, owner: userId }, ['_id']).exec()
        .then((data) => {
        if (data) {
            newReview.admin = true;
        }
    });
    new review_1.Review(newReview).save()
        .then((review) => {
        const item = review._doc;
        item.owner = {
            name,
            _id: userId
        };
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            item
        });
        if (type === 'reply') {
            review_1.Review.update({ _id: replyTo }, { $inc: { numOfReply: 1 } })
                .catch((err) => console.error(err));
        }
    })
        .catch((err) => util_1.errHandler(err, res));
}));
router.get('/delete/:id', middle_ware_1.checkObjectId, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const session = req.session;
    const userId = session.user._id;
    const reviewId = req.params.id;
    let review;
    yield review_1.Review.findById(reviewId).populate('meeting', ['owner'])
        .populate('owner', ['_id'])
        .exec()
        .then((doc) => {
        review = doc;
    });
    if (!review) {
        res.json({
            code: interface_1.ResponseCode.FIND_NOTHING
        });
        return;
    }
    // 既不是创建者也不是相应会议管理员
    if (review.owner._id.toString() !== userId && review.meeting.owner.toString() !== userId) {
        res.json({ code: interface_1.ResponseCode.ACCESS_DENIED });
        return;
    }
    review_1.Review.findOneAndRemove({ _id: reviewId }).exec()
        .then((doc) => {
        if (doc.replyTo) {
            review_1.Review.updateOne({ _id: doc.replyTo }, { $inc: { numOfReply: -1 } }).exec()
                .then(() => res.json({ code: interface_1.ResponseCode.SUCCESS }));
        }
        else {
            res.json({ code: interface_1.ResponseCode.SUCCESS });
        }
    })
        .catch((err) => util_1.errHandler(err, res));
}));
module.exports = router;
//# sourceMappingURL=review.js.map