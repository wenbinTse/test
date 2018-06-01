"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const EJS = require("ejs");
const moment = require("moment");
const email = require('nodemailer');
const sender = email.createTransport({
    host: config_1.default.emailHost,
    port: 25,
    secure: false,
    auth: {
        user: config_1.default.emailUsername,
        pass: config_1.default.emailPassword
    }
});
const projectENV = process.env.NODE_ENV ? `(${process.env.NODE_ENV})` : '';
exports.sendText = (addressee, subject, text) => {
    const options = {
        from: `${config_1.default.administrator}<${config_1.default.emailUsername}>`,
        bcc: `${addressee.name}<${addressee.email}>`,
        subject: subject + projectENV,
        text
    };
    sender.sendMail(options);
};
const templatePath = process.cwd() + '/src/views/';
const sendHTML = (addressees, subject, templateFileName, data, cb) => {
    const path = templatePath + templateFileName;
    data.domain = config_1.default.domain;
    data.addressee = addressees[0];
    EJS.renderFile(path, data, (err, html) => {
        if (err) {
            if (cb) {
                cb(err);
            }
            return;
        }
        const options = {
            from: `${config_1.default.administrator}<${config_1.default.emailUsername}>`,
            bcc: addressees.map((addressee) => `${addressee.name}<${addressee.email}>`).toString(),
            subject: subject + projectENV,
            html
        };
        console.log(options);
        sender.sendMail(options).then((res) => {
            console.log(res);
            if (cb) {
                cb(null);
            }
        }).catch((err) => {
            if (cb) {
                cb(err);
            }
        });
    });
};
exports.welcome = (addressee, hash) => {
    sendHTML([addressee], '激活您的账号', 'welcome.ejs', { url: `${config_1.default.domain}/verify/${addressee._id}/${hash}` });
};
exports.verificationCode = (addressee, code) => {
    sendHTML([addressee], '验证码', 'verification-code.ejs', { code });
};
exports.registerMeeting = (addressee, meeting) => {
    sendHTML([addressee], '成功注册会议', 'register-meeting.ejs', { meeting });
};
exports.promotion = (addressees, meeting, cb) => {
    meeting.startDate = moment(meeting.startDate).format('M月D号');
    meeting.endDate = moment(meeting.endDate).format('M月D号');
    sendHTML(addressees, `欢迎参加${meeting.name}`, 'promotion.ejs', { meeting }, cb);
};
//# sourceMappingURL=email.js.map