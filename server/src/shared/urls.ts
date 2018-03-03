import Config from './config';

export class Urls {
  public static profileImage = (id: string) => {
    if (id) {
      return  Config.server + '/api/file/profileImage/' + id;
    }
    return '';
  }
  public static meetingImage = (id: string) => Config.server + '/api/file/meetingImage/' + id;
}
