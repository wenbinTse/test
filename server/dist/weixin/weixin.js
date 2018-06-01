"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const config_1 = require("../shared/config");
const crypto = require('crypto');
class Weixin {
    static init() {
        Weixin.getAccessToken();
        setInterval(Weixin.getAccessToken, 60 * 60 * 1000);
    }
}
Weixin.accessToken = '';
Weixin.jsapiTicket = '';
Weixin.accessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config_1.default.weixinAppId}&secret=${config_1.default.weixinSecret}`;
Weixin.getAccessToken = () => {
    request.get(Weixin.accessTokenUrl, (err, res, body) => {
        console.log(body);
        Weixin.accessToken = JSON.parse(body).access_token;
        Weixin.getJsapiTicket();
    });
};
Weixin.getJsapiTicket = () => {
    request.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${Weixin.accessToken}&type=jsapi`, (err, res, body) => {
        console.log(body);
        Weixin.jsapiTicket = JSON.parse(body).ticket;
    });
};
Weixin.getSignature = (url) => {
    const timestamp = '0';
    const nonceStr = crypto.randomBytes(1).toString('hex');
    const str = `jsapi_ticket=${Weixin.jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    return {
        appId: config_1.default.weixinAppId,
        timestamp,
        nonceStr,
        signature: crypto.createHash('sha1').update(str).digest('hex'),
        jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表
    };
};
exports.Weixin = Weixin;
//# sourceMappingURL=weixin.js.map