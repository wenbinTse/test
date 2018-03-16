import { Addressee } from './interface';
import Config from './config';
import * as EJS from 'ejs';

const email = require('nodemailer');

const sender = email.createTransport({
  host: Config.emailHost,
  secureConnection: true, // using SSL
  auth: {
    user: Config.emailUsername,
    pass: Config.emailPassword
  }
});

const projectENV = process.env.NODE_ENV ? `(${process.env.NODE_ENV})` : '';

export const sendText = (
  addressee: Addressee,
  subject: string,
  text: string
) => {
  const options = {
    from: `${Config.administrator}<${Config.emailUsername}>`,
    to:  `${addressee.name}<${addressee.email}>`,
    subject: subject + projectENV,
    text
  };
  sender.sendMail(options);
};

const templatePath = process.cwd() + '/src/views/';

const sendHTML = (
  addressee: Addressee,
  subject: string,
  templateFileName: string,
  data: {[name: string]: any},
  cb?: (err: any) => void
) => {
  const path = templatePath + templateFileName;
  data.domain = Config.domain;
  data.addressee = addressee;
  EJS.renderFile(path,
    data,
    (err, html) => {
      if (err) {
        console.error(err);
        if (cb) {
          cb(err);
        }
        return;
      }
      const options = {
        from: `${Config.administrator}<${Config.emailUsername}>`,
        to:  `${addressee.name}<${addressee.email}>`,
        subject: subject + projectENV,
        html
      };
      sender.sendMail(options).then(() => console.log('send'))
        .catch((err: any) => console.error(err));
    });
};

export const welcome = (addressee: Addressee, hash: string) => {
  sendHTML(
    addressee,
    '激活您的账号',
    'welcome.ejs',
    {url: `${Config.domain}/verify/${addressee._id}/${hash}`}
  );
};

export const verificationCode = (addressee: Addressee, code: string) => {
  sendHTML(
    addressee,
    '验证码',
    'verification-code.ejs',
    {code}
  );
};

export const registerMeeting = (addressee: Addressee, meeting: {_id: string, name: string}) => {
  sendHTML(
    addressee,
    '成功注册会议',
    'register-meeting.ejs',
    {meeting}
  );
};
