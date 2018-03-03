const port = 5000;

const devDomain = 'http://localhost:8080';
const devServer = 'http://localhost:' + port;
const productDomain = 'www.baidu.com'; // replace domain!!!
const cdnDomain = 'cdn.baidu.com';

const domain = process.env.NODE_ENV ? devDomain : productDomain;
const server = process.env.NODE_ENV ? devServer : productDomain;

export default {
  // dbUrl: 'mongodb://tsinghua:bishe@ds111478.mlab.com:11478/tsinghua_dev',
  dbUrl: 'mongodb://localhost:27017/bishe',
  port: port,
  sessionMaxAge: 30 * 24 * 60 * 60 * 1000,
  passwordMinLength: 8,
  hashIterationNum: 10000,
  keyLength: 128,
  emailUsername: 'bisheqinghua@sina.com',
  emailPassword: 'bisheqinghua',
  emailHost: 'smtp.sina.com',
  administrator: '清华大学出版社',
  domain: domain,
  server: server,
  cdnDomain: cdnDomain
};
