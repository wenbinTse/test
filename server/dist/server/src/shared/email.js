"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const EJS = require("ejs");
const email = require('nodemailer');
const sender = email.createTransport({
    host: config_1.default.emailHost,
    secureConnection: true,
    auth: {
        user: config_1.default.emailUsername,
        pass: config_1.default.emailPassword
    }
});
const projectENV = process.env.NODE_ENV ? `(${process.env.NODE_ENV})` : '';
exports.sendText = (addressee, subject, text) => {
    const options = {
        from: `${config_1.default.administrator}<${config_1.default.emailUsername}>`,
        to: `${addressee.name}<${addressee.email}>`,
        subject: subject + projectENV,
        text
    };
    sender.sendMail(options);
};
const templatePath = process.cwd() + '/src/views/';
const sendHTML = (addressee, subject, templateFileName, data, cb) => {
    const path = templatePath + templateFileName;
    data.domain = config_1.default.domain;
    EJS.renderFile(path, data, (err, html) => {
        if (err) {
            console.error(err);
            if (cb) {
                cb(err);
            }
            return;
        }
        const options = {
            from: `${config_1.default.administrator}<${config_1.default.emailUsername}>`,
            to: `${addressee.name}<${addressee.email}>`,
            subject: subject + projectENV,
            html
        };
        sender.sendMail(options).then(() => console.log('send'))
            .catch((err) => console.error(err));
    });
};
exports.welcome = (addressee, hash) => {
    sendHTML(addressee, '激活您的账号', 'welcome.ejs', { url: `${config_1.default.domain}/verify/${addressee._id}/${hash}` });
};
exports.verificationCode = (addressee, code) => {
    sendHTML(addressee, '验证码', 'verification-code.ejs', { code });
};
//# sourceMappingURL=email.js.map