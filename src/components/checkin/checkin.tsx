import * as React from 'react';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode } from '../../interface';
import { Button, Spin, message } from 'antd';
import { loading } from '../user/user.css';

interface Props {
  params: {
    meetingId: string
  };
}

interface State {
  loading: boolean;
}

class Checkin extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  private wx: any;
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
          this.setState({loading: false});
          this.wx = (window as any).wx;
          this.wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
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
      return <div/>;
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
      success(res: any) {
        console.log(res);
      },
      fail(res: any) {
        console.log(res);
      }
    });
  }
}

export default Checkin;
