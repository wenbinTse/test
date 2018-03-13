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
const router = express_1.Router();
const Review = require('../../models/review');
const Meeting = require('../../models/meeting');
const User = require('../../models/user');
function getReviews(condition, res) {
    Review.find(condition)
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
router.post('/add', middle_ware_1.checkLogin, (req, res) => __awaiter(this, void 0, void 0, function* () {
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
    yield Meeting.findOne({ _id: meetingId, owner: userId }, ['_id']).exec()
        .then((data) => {
        if (data) {
            newReview.admin = true;
        }
    });
    new Review(newReview).save()
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
            Review.update({ _id: replyTo }, { $inc: { numOfReply: 1 } })
                .catch((err) => console.error(err));
        }
    })
        .catch((err) => util_1.errHandler(err, res));
}));
module.exports = router;
//# sourceMappingURL=review.js.map