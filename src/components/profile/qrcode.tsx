import * as React from 'react';
import UserService from '../user/user-service';
import Urls from '../../urls';

class QrCode extends React.Component<{}, {}> {
  private userId: any;
  constructor(props: {}) {
    super(props);
    const user = UserService.getUserProfile();
    this.userId = user._id;
  }
  public render() {
    const qrSrc = Urls.qrcode(this.userId);
    return (
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center'}}>
        <img src={qrSrc}/>
        <h3 style={{marginTop: '16px'}}>签到时请出示此二维码</h3>
      </div>
    );
  }
}

export default QrCode;
