const SERVER_URL: string = process.env.REACT_APP_ENV === 'dev' &&
process.env.NODE_ENV === 'development' ? 'http://localhost:5000' :
  window.location.protocol + '//' + window.location.host;

const API_URL: string = SERVER_URL + '/api';
const USER_URL: string = API_URL + '/user';
const MEETING_ADMIN_URL = API_URL + '/meeting-admin';

export default class Urls {

  // User Api
  public static login = USER_URL + '/login';
  public static register = USER_URL + '/register';
  public static logout = USER_URL + '/logout';
  public static dataForRegister = USER_URL + '/dataForRegister';
  public static currentUserInfo = USER_URL + '/currentUserInfo';
  public static verify = (userId: string, hash: string) => USER_URL + `/verify/${userId}/${hash}`;
  public static sendVerificationCode = (email: string) => USER_URL + `/sendVerificationCode/${email}`;
  public static resetPassword = USER_URL + `/resetPassword`;

  // Meeting Admin Api
  public static createMeeting = MEETING_ADMIN_URL + '/create';

  // Get Corporation
  public static getCorporation = API_URL + '/corporation';

  // Get Cities
  public static getCities = API_URL + '/cities';
}
