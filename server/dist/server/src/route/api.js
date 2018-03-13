"use strict";
const express_1 = require("express");
const interface_1 = require("../shared/interface");
const util_1 = require("../shared/util");
const urls_1 = require("../shared/urls");
const corporation = require('../../data/corporation.json');
const router = express_1.Router();
const Meeting = require('../models/meeting');
const FeaturedMeeting = require('../models/featured-meeting');
router.get('/corporation', (req, res) => {
    res.json({ list: corporation });
});
const cities = require('../../data/cities.json');
router.get('/cities', (req, res) => {
    const formatCities = [];
    Object.keys(cities).map((key) => {
        const item = { label: key, value: key, children: [] };
        for (const city of cities[key]) {
            item.children.push({
                label: city,
                value: city
            });
        }
        formatCities.push(item);
    });
    res.json({ list: formatCities });
});
router.get('/dataForHome', (req, res) => {
    let meetings;
    Meeting.find({ status: { $ne: interface_1.Status.DELETED } })
        .exec()
        .then((data) => {
        const list = [];
        for (const item of data) {
            const newItem = item._doc;
            newItem.images = item.images.map((image) => urls_1.Urls.meetingImage(image));
            list.push(newItem);
        }
        meetings = list;
        return FeaturedMeeting.find({}).populate('meeting', ['images', 'name']).exec();
    })
        .then((docs) => {
        const list = docs.map((doc) => doc.meeting);
        const newList = [];
        for (const item of list) {
            const newItem = item._doc;
            newItem.images = item.images.map((image) => urls_1.Urls.meetingImage(image));
            newList.push(newItem);
        }
        res.json({
            code: interface_1.ResponseCode.SUCCESS,
            meetings,
            featuredMeetings: newList
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
const userRouter = require('./user/user');
const meetingRouter = require('./meeting/meeting');
const userAdminRouter = require('./user/user-admin');
const meetingAdminRouter = require('./meeting/meeting-admin');
const reviewRouter = require('./review/review');
const userProfileRouter = require('./user/user-profile');
const fileRouter = require('./file/file');
router.use('/user', userRouter);
router.use('/user-admin', userAdminRouter);
router.use('/meeting', meetingRouter);
router.use('/meeting-admin', meetingAdminRouter);
router.use('/review', reviewRouter);
router.use('/profile', userProfileRouter);
router.use('/file', fileRouter);
module.exports = router;
//# sourceMappingURL=api.js.map