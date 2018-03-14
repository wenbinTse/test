import * as React from 'react';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode } from '../../interface';
import { Button, Spin, message } from 'antd';
import UserService from '../user/user-service';

interface Props {
  params: {
    meetingId: string
  };
}

interface State {
  loading: boolean;
}

class Checkin extends React.Component<Props, State> {
  
  private wx: any;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  private isWeixin = navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;

  public componentDidMount() {
  
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://res.wx.qq.com/open/js/jweixin-1.2.0.js';
    script.onload = () => {
      HttpRequestDelegate.get(
      Urls.initcheckingIn(this.props.params.meetingId),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          alert(33)
          this.setState({loading: false});
          this.wx = (window as any).wx;
          this.wx.config({
            appId: data.wx.appId, // 必填，公众号的唯一标识
            timestamp: data.wx.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.wx.nonceStr, // 必填，生成签名的随机串
            signature: data.wx.signature, // 必填，签名
            jsApiList: data.wx.jsApiList // 必填，需要使用的JS接口列表
          });
          this.wx.error((res: any) => console.error(res));
        }
      });
    };
    document.body.appendChild(script);
  }

  public render() {
    if (!this.isWeixin) {
      message.warn('请在微信中打开');
      return <div className="container container-large"><h1>请在微信中打开</h1></div>;
    }
    if (this.state.loading) {
      return (
        <Spin/>
      );
    }
    return (
      <div>
        <Button onClick={() => this.scanHandler()}>扫描</Button>
      </div>
    );
  }

  private scanHandler = () => {
    this.wx.scanQRCode({
      needResult: 1,
      scanType: ['qrCode'],
      success: function(res: any) {
        alert(res.resultStr);
        HttpRequestDelegate.get(
          Urls.checkIn(this.props.params.meetingId, this.userId),
          true,
          (data: any) => {
            if (data.code === ResponseCode.SUCCESS) {
              message.success('签到成功');
            } else if (data.code === ResponseCode.UNLOGIN) {
              UserService.requireLogin();
            } else if (data.code === ResponseCode.INCOMPLETE_INPUT || data.code === ResponseCode.DUPLICATE_KEY) {
              message.warning(data.message);
            }
          }
        );
      },
      // tslint:disable-next-line:only-arrow-functions
      fail: function(res: any) {
        message.error(res);
        alert(2)
        console.log(res);
      },
      // tslint:disable-next-line:only-arrow-functions
      complete: function(res: any) {
        alert(3)
      }
    });
  }
}

export default Checkin;
