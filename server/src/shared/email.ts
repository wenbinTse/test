import { Addressee } from './interface';
import Config from './config';
import * as EJS from 'ejs';
import * as moment from 'moment';

const email = require('nodemailer');

const sender = email.createTransport({
  host: Config.emailHost,
  port: 25,
  secure: false,
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
    bcc:  `${addressee.name}<${addressee.email}>`,
    subject: subject + projectENV,
    text
  };
  sender.sendMail(options);
};

const templatePath = process.cwd() + '/src/views/';

const sendHTML = (
  addressees: Addressee[],
  subject: string,
  templateFileName: string,
  data: {[name: string]: any},
  cb?: (err: any) => void
) => {
  const path = templatePath + templateFileName;
  data.domain = Config.domain;
  data.addressee = addressees[0];
  EJS.renderFile(path,
    data,
    (err, html) => {
      if (err) {
        if (cb) {
          cb(err);
        }
        return;
      }
      const options = {
        from: `${Config.administrator}<${Config.emailUsername}>`,
        bcc:  addressees.map((addressee) => `${addressee.name}<${addressee.email}>`).toString(),
        subject: subject + projectENV,
        html
      };
      console.log(options)
      sender.sendMail(options).then((res: any) => {
        console.log(res);
        if (cb) {
          cb(null);
        }
      }).catch((err: any) => {
          if (cb) {
            cb(err);
          }
        });
    });
};

export const welcome = (addressee: Addressee, hash: string) => {
  sendHTML(
    [addressee],
    '激活您的账号',
    'welcome.ejs',
    {url: `${Config.domain}/verify/${addressee._id}/${hash}`}
  );
};

export const verificationCode = (addressee: Addressee, code: string) => {
  sendHTML(
    [addressee],
    '验证码',
    'verification-code.ejs',
    {code}
  );
};

export const registerMeeting = (addressee: Addressee, meeting: {_id: string, name: string}) => {
  sendHTML(
    [addressee],
    '成功注册会议',
    'register-meeting.ejs',
    {meeting}
  );
};

export const promotion = (addressees: Addressee[], meeting: any, cb: (err: any) => void) => {
  meeting.startDate = moment(meeting.startDate).format('M月D号');
  meeting.endDate = moment(meeting.endDate).format('M月D号');
  sendHTML(
    addressees,
    `欢迎参加${meeting.name}`,
    'promotion.ejs',
    {meeting},
    cb
  );
};
