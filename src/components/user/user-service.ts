import UserModal = require('./user-modal');
import { ResponseCode, UserMode } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { message } from 'antd';

export default class UserService {
  private static userModalElement: UserModal;

  public static bindUserModalElement(modal: UserModal) {
    this.userModalElement = modal;
  }

  public static requireLogin() {
    this.userModalElement.setState({visible: true, mode: UserMode.LOGIN});
  }

  public static dismissLogin() {
    this.userModalElement.setState({visible: false, mode: UserMode.LOGIN});
  }

  public static requireSignup() {
    this.userModalElement.setState({visible: true, mode: UserMode.REGISTER});
  }

  public static dismissSignup() {
    this.userModalElement.setState({visible: false, mode: UserMode.REGISTER});
  }

  public static logout() {
    HttpRequestDelegate.get(
      Urls.logout,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('已登出');
          window.localStorage.removeItem('user');
          window.location.reload();
        } else {
          message.warn('请稍后再试');
        }
      }
    );
  }

  public static getUserProfile() {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
  }

  public static requestUserProfile(callback: () => void) {
    HttpRequestDelegate.get(
      Urls.currentUserInfo,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          window.localStorage.setItem('user', JSON.stringify(data.item));
        } else if (data.code === ResponseCode.UNLOGIN) {
          window.localStorage.removeItem('user');
        }
        callback();
      }
    );
  }
}
