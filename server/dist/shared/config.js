"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port = 80;
const devDomain = 'http://localhost:8080';
const devServer = 'http://localhost:' + port;
const productDomain = '39.107.95.124'; // replace domain!!!
const cdnDomain = '39.107.95.124';
const devDbUrl = 'mongodb://localhost:27017/bishe';
const prodDbUrl = 'mongodb://xiewenbin:xiewenbin@dds-2zefda6af14cf5941.mongodb.rds.aliyuncs.com:3717,dds-2zefda6af14cf5942.mongodb.rds.aliyuncs.com:3717/bishe?replicaSet=mgset-5363213';
const dbUrl = process.env.NODE_ENV !== 'production' ? devDbUrl : prodDbUrl;
const domain = process.env.NODE_ENV !== 'production' ? devDomain : productDomain;
const server = process.env.NODE_ENV !== 'production' ? devServer : productDomain;
exports.default = {
    // dbUrl: 'mongodb://tsinghua:bishe@ds111478.mlab.com:11478/tsinghua_dev',
    dbUrl: dbUrl,
    port: port,
    sessionMaxAge: 30 * 24 * 60 * 60 * 1000,
    passwordMinLength: 8,
    hashIterationNum: 10000,
    keyLength: 128,
    emailUsername: 'tsinghua@xiewb.top',
    emailPassword: 'Tsinghua!',
    emailHost: 'smtp.mxhichina.com',
    administrator: '清华大学出版社',
    domain: domain,
    server: server,
    cdnDomain: cdnDomain,
    weixinAppId: 'wx3cb4e8ddf808458d',
    weixinSecret: '1f4e65f6740fdd01dcc41fe535502316'
};
//# sourceMappingURL=config.js.map