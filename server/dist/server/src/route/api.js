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
const interface_1 = require("../shared/interface");
const util_1 = require("../shared/util");
const urls_1 = require("../shared/urls");
const meeting_1 = require("../models/meeting");
const featured_meeting_1 = require("../models/featured-meeting");
const corporation = require('../../data/corporation.json');
const router = express_1.Router();
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
    meeting_1.Meeting.find({ status: { $ne: interface_1.Status.DELETED } })
        .exec()
        .then((data) => {
        const list = [];
        for (const item of data) {
            const newItem = item._doc;
            newItem.images = item.images.map((image) => urls_1.Urls.meetingImage(image));
            list.push(newItem);
        }
        meetings = list;
        return featured_meeting_1.FeaturedMeeting.find({}).populate('meeting', ['images', 'name']).exec();
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
const user_1 = require("../models/user");
const password_1 = require("../shared/password");
const middle_ware_1 = require("../shared/middle-ware");
const titles = ['教授', '副教授', '讲师', '学生', '其他'];
const corporations = ['清华大学', '北京大学', '北京航空航天大学', '复旦大学', '其他'];
const jobs = ['计算机学院院长', '校长', '党委数据', '计算机学院党委书记', ''];
router.get('/createusers', (req, res) => __awaiter(this, void 0, void 0, function* () {
    for (let i = 0; i < 100; i++) {
        const user = new user_1.User({
            name: 'test_' + i,
            email: `test__${i}@test.com`,
            password: password_1.createHashAndSalt('xiewenbin'),
            gender: Math.floor(Math.random() * 2) === 1 ? interface_1.Gender.FEMALE : interface_1.Gender.MALE,
            title: titles[Math.floor(Math.random() * 5)],
            corporation: corporations[Math.floor(Math.random() * 5)],
            job: jobs[Math.floor(Math.random() * 5)]
        });
        yield user.save().then(() => console.log(i))
            .catch((err) => console.log(err));
    }
    res.json({ code: interface_1.ResponseCode.SUCCESS });
}));
const userRouter = require('./user/user');
const meetingRouter = require('./meeting/meeting');
const meetingAdminRouter = require('./meeting/meeting-admin');
const reviewRouter = require('./review/review');
const userProfileRouter = require('./user/user-profile');
const fileRouter = require('./file/file');
const checkInRouter = require('./checkin/checkin');
const adminRouter = require('./admin/admin');
router.use('/user', userRouter);
router.use('/meeting', meetingRouter);
router.use('/meetingAdmin', meetingAdminRouter);
router.use('/review', reviewRouter);
router.use('/profile', userProfileRouter);
router.use('/file', fileRouter);
router.use('/checkIn', checkInRouter);
router.use('/admin', middle_ware_1.checkLogin, middle_ware_1.checkAdmin, adminRouter);
module.exports = router;
//# sourceMappingURL=api.js.map