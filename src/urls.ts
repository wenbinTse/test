const SERVER_URL: string = process.env.REACT_APP_ENV === 'dev' &&
process.env.NODE_ENV === 'development' ? 'http://localhost:80' :
  window.location.protocol + '//' + window.location.host;

const API_URL: string = SERVER_URL + '/api';
const USER_URL: string = API_URL + '/user';
const MEETING_ADMIN_URL = API_URL + '/meeting-admin';
const MEETING_URL = API_URL + '/meeting/';
const REVIEW_URL = API_URL + '/review';
const PROFILE_URL = API_URL + '/profile';

export default class Urls {
  // Home Api
  public static dataForHome = API_URL + '/dataForHome';

  // User Api
  public static login = USER_URL + '/login';
  public static register = USER_URL + '/register';
  public static logout = USER_URL + '/logout';
  public static dataForRegister = USER_URL + '/dataForRegister';
  public static currentUserInfo = USER_URL + '/currentUserInfo';
  public static verify = (userId: string, hash: string) => USER_URL + `/verify/${userId}/${hash}`;
  public static sendVerificationCode = (email: string) => USER_URL + `/sendVerificationCode/${email}`;
  public static resetPassword = USER_URL + `/resetPassword`;

  // User Profile Api
  public static dataForProfile = PROFILE_URL + '/dataForProfile';
  public static editProfile = PROFILE_URL + '/edit';
  public static editProfileImage = PROFILE_URL + '/editProfileImage';
  public static userMeetings = PROFILE_URL + '/meetings';
  public static cancelAttendance = (attendanceId: string) => PROFILE_URL + '/cancelAttendance/' + attendanceId;
  // Meeting Api
  public static getMeeting = (meetingId: string) => MEETING_URL + `/${meetingId}`;
  public static searchMeeting = MEETING_URL + '/search';
  public static registerMeeting = MEETING_URL + '/register';

  // Meeting Manage Api
  public static dataForMeetingManage = (id: string) => MEETING_ADMIN_URL + '/dataForMeetingManage/' + id; 
  public static editMeeting = (id: string) => MEETING_ADMIN_URL + '/edit/' + id;
  public static meetingImages = (id: string) => MEETING_ADMIN_URL + '/images/' + id;
  public static uploadMeetingImage = (id: string) => MEETING_ADMIN_URL + '/uploadImage/' + id;
  public static deleteMeetingImage = (meetingId: string, imageId: string) => MEETING_ADMIN_URL + `/deleteImage/${meetingId}/${imageId}`;
  public static meetingFiles = (id: string) => MEETING_ADMIN_URL + '/files/' + id;
  public static uploadMeetingFile = (id: string) => MEETING_ADMIN_URL + '/uploadFile/' + id;
  public static deleteMeetingFile = (meetingId: string, fileId: string) => MEETING_ADMIN_URL + `/deleteFile/${meetingId}/${fileId}`;
  public static meetingApplicants = (meetingId: string) => MEETING_ADMIN_URL + '/applicants/' + meetingId;
  public static auditAttendance = (meetingId: string) => MEETING_ADMIN_URL + '/auditAttendance/' + meetingId;
  public static refuseAttendance = (meetingId: string) => MEETING_ADMIN_URL + '/refuseAttendance/' + meetingId;

  // Meeting Admin Api
  public static createMeeting = MEETING_ADMIN_URL + '/create';

  // Get Corporation
  public static getCorporation = API_URL + '/corporation';

  // Get Cities
  public static getCities = API_URL + '/cities';

  // File API
  public static download = (id: string, fileName: string) => API_URL + `/file/file/${id}/${fileName}`;

  // Review API
  public static getReviews = (meetingId: string) => REVIEW_URL + `/getReviews/${meetingId}`;
  public static addReview = REVIEW_URL + '/add';
  public static getReplies = (reviewId: string) => REVIEW_URL + `/getReplies/${reviewId}`;
  
  // Check-IN API
  public static checkIn = (meetingId: string, userId: string) => API_URL + `/checkIn/${meetingId}/${userId}`;
  public static initcheckingIn = (meetingId: string) => API_URL + '/checkIn/init/' + meetingId;
}
