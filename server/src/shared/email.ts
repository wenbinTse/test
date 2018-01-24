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

const templatePath = process.cwd() + '/src/views';

const sendHTML = (
  addressee: Addressee,
  subject: string,
  templateFileName: string,
  data: {[name: string]: any},
  cb?: (err: any) => void
) => {
  const path = templatePath + templateFileName;
  data.domain = Config.domain;
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
      sender.sendMail(options);
    });
};
