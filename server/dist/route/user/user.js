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
const pattern_1 = require("../../shared/pattern");
const config_1 = require("../../shared/config");
const password_1 = require("../../shared/password");
const Email = require("../../shared/email");
const urls_1 = require("../../shared/urls");
const user_1 = require("../../models/user");
const crypto = require('crypto');
const router = express_1.Router();
const corporations = require('../../../data/corporation.json');
const titles = require('../../../data/title.json');
router.get('/dataForRegister', (req, res) => {
    res.json({
        code: interface_1.ResponseCode.SUCCESS,
        corporations,
        titles
    });
});
router.post('/register', (req, res) => {
    const name = req.body.name;
    const gender = req.body.gender;
    const password = req.body.password;
    const email = req.body.email;
    const corporation = req.body.corporation;
    const title = req.body.title;
    const job = req.body.job;
    if (!name || !gender || !corporation
        || !password || !email || !title) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    if (!pattern_1.default.email.test(email)) {
        res.json({
            code: interface_1.ResponseCode.INVALID_INPUT,
            msg: 'invalid email'
        });
        return;
    }
    if (password.length < config_1.default.passwordMinLength) {
        res.json({
            code: interface_1.ResponseCode.INVALID_INPUT,
            message: 'Passwords must be at least ' + config_1.default.passwordMinLength + ' characters in length'
        });
        return;
    }
    const hash = crypto.randomBytes(12).toString('hex');
    const user = new user_1.User({
        name,
        gender,
        password: password_1.createHashAndSalt(password),
        email,
        corporation,
        title,
        job,
        hashForValidation: hash,
        validated: false
    });
    user.save()
        .then((data) => {
        Email.welcome({ name, email, _id: data._id }, hash);
        const session = req.session;
        session.user = data;
        session.save((err) => {
            if (err) {
                util_1.errHandler(err, res);
            }
            else {
                res.json({
                    code: interface_1.ResponseCode.SUCCESS,
                    item: data
                });
            }
        });
    })
        .catch((err) => {
        console.error(err);
        if (err.code === interface_1.ResponseCode.DUPLICATE_KEY) {
            res.json({
                code: interface_1.ResponseCode.DUPLICATE_KEY,
                key: 'email'
            });
        }
        else {
            res.json({ code: interface_1.ResponseCode.ERROR });
        }
    });
});
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    user_1.User.findOne({ email, status: interface_1.Status.ACTIVE }, ['_id', 'email', 'userType', 'profileImage', 'password', 'name']).exec()
        .then((doc) => {
        if (!doc || !password_1.verifyPassword(password, doc.password.salt, doc.password.hash)) {
            res.json({
                code: interface_1.ResponseCode.INCORRECT_USERNAME_OR_PASSWORD,
            });
            return;
        }
        const session = req.session;
        session.user = doc;
        session.save((err) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                res.json({ code: interface_1.ResponseCode.ERROR });
                console.error(err);
                return;
            }
            const item = {
                _id: doc._id,
                email: doc.email,
                userType: doc.userType,
                profileImage: doc.profileImage,
                profileImageSrc: urls_1.Urls.profileImage(doc.profileImage)
            };
            res.json({
                code: interface_1.ResponseCode.SUCCESS,
                item
            });
        }));
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                util_1.errHandler(err, res);
                return;
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.json({ code: interface_1.ResponseCode.SUCCESS });
        });
    }
});
router.get('/verify/:userId/:hash', (req, res) => {
    const _id = req.params.userId;
    user_1.User.findById(_id, ['hashForValidation']).exec()
        .then((user) => {
        if (user.hashForValidation === req.params.hash) {
            user_1.User.update({ _id }, { $set: { validated: true } }).exec()
                .then(() => {
                res.json({ code: interface_1.ResponseCode.SUCCESS });
            });
        }
        else {
            res.json({ code: interface_1.ResponseCode.INVALID_INPUT });
        }
    })
        .catch((err) => util_1.errHandler(err, res));
});
router.get('/sendVerificationCode/:email', (req, res) => {
    const email = req.params.email;
    user_1.User.findOne({ email: email }, ['verificationCode', 'name']).exec()
        .then((user) => {
        if (!user) {
            res.json({
                code: interface_1.ResponseCode.UNREGISTERED,
                message: 'the mailbox has not been registered yet'
            });
            return;
        }
        if (user.verificationCode) {
            const lastSendTime = user.verificationCode.sendTime.getTime();
            const now = new Date().getTime();
            if (now - lastSendTime < 60 * 1000) {
                res.json({
                    code: interface_1.ResponseCode.TOO_OFTEN,
                    message: 'send just one time each minute'
                });
                return;
            }
        }
        const code = Math.random().toString(10).substring(2, 8);
        const verificationCode = {
            code: code,
            sendTime: new Date()
        };
        user_1.User.update({ email: email }, { $set: { verificationCode: verificationCode } }).exec()
            .then(() => {
            Email.verificationCode({ name: user.name, email }, code);
            res.json({ code: interface_1.ResponseCode.SUCCESS });
        });
    })
        .catch((err) => util_1.errHandler(err, res));
});
const verifyCode = (verificationCode, code) => {
    if (!verificationCode) {
        return false;
    }
    if (new Date().getTime() - verificationCode.sendTime.getTime() > 5 * 60 * 1000) {
        return false;
    }
    if (verificationCode.code !== code) {
        return false;
    }
    return true;
};
router.post('/resetPassword', (req, res) => {
    const email = req.body.email;
    const code = req.body.code;
    const password = req.body.password;
    if (!email || !code || !password) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    user_1.User.findOne({ email }, ['verificationCode', 'name', '_id']).exec()
        .then((user) => {
        if (!verifyCode(user.verificationCode, code)) {
            res.json({ code: interface_1.ResponseCode.INVALID_INPUT });
            return;
        }
        const hash = crypto.randomBytes(12).toString('hex');
        user_1.User.update({ email }, { $set: {
                password: password_1.createHashAndSalt(password),
                hashForValidation: hash,
                validated: false
            } })
            .exec()
            .then(() => {
            res.json({ code: interface_1.ResponseCode.SUCCESS });
            Email.welcome({ email, name: user.name, _id: user._id }, hash);
        });
    });
});
router.get('/:id', (req, res) => {
    user_1.User.findOne({ _id: req.params.id }, ['name', 'createdDate']).exec()
        .then((data) => res.json({
        code: interface_1.ResponseCode.SUCCESS,
        item: data
    }))
        .catch((err) => util_1.errHandler(err, res));
});
module.exports = router;
//# sourceMappingURL=user.js.map