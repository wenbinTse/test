import request = require('request');
import Config from '../shared/config';
const crypto = require('crypto');

export class Weixin {
  static accessToken = '';
  static jsapiTicket = '';
  static accessTokenUrl =  `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${Config.weixinAppId}&secret=${Config.weixinSecret}`;
  static init() {
    Weixin.getAccessToken();
    setInterval(Weixin.getAccessToken, 60 * 60 * 1000);
  }
  static getAccessToken = () => {
    request.get(Weixin.accessTokenUrl, (err, res, body) => {
      console.log('access_token: ' + res.statusCode);
      console.log(body);
      Weixin.accessToken = JSON.parse(body).access_token;
      Weixin.getJsapiTicket();
    });
  };

  static getJsapiTicket = () => {
    request.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${Weixin.accessToken}&type=jsapi`, (err, res, body) => {
      console.log('js_ticket: ' + res.statusCode);
      console.log(body);
      Weixin.jsapiTicket = JSON.parse(body).ticket;
    });
  }

  static getSignature = (url: string) => {
    const timestamp = '0';
    const nonceStr = crypto.randomBytes(1).toString('hex');
    const str =  `jsapi_ticket=${Weixin.jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    return {
      appId: Config.weixinAppId, // 必填，公众号的唯一标识
      timestamp, // 必填，生成签名的时间戳
      nonceStr, // 必填，生成签名的随机串
      signature: crypto.createHash('sha1').update(str).digest('hex'),// 必填，签名
      jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表
    };
  }
}
