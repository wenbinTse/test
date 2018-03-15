import * as React from 'react';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode, Attendance } from '../../interface';
import { Button, Spin, message } from 'antd';
import UserService from '../user/user-service';
import * as Styles from './meeting-manage.css';
import * as moment from 'moment';

interface Props {
  params: {
    meetingId: string
  };
}

interface State {
  loading: boolean;
  attendance?: Attendance;
}

class Checkin extends React.Component<Props, State> {
  
  private wx: any;
  private isWeixin = navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true
    };
  }

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
          this.wx = (window as any).wx;
          this.wx.config({
            appId: data.wx.appId, // 必填，公众号的唯一标识
            timestamp: data.wx.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.wx.nonceStr, // 必填，生成签名的随机串
            signature: data.wx.signature, // 必填，签名
            jsApiList: data.wx.jsApiList // 必填，需要使用的JS接口列表
          });
          this.wx.error((res: any) => console.error(res));
          this.setState({loading: false});
        }
      });
    };
    document.body.appendChild(script);
  }

  public render() {
    const url = window.location.href; 
    if (!this.isWeixin) {
      message.warn('请在微信中打开');
      return (
        <div className="container container-large container-center">
          <img src={Urls.qrcode(url)} className={Styles.qrcode}/>
          <h1>请在微信中打开</h1>
        </div>
      );
    }
    if (this.state.loading) {
      return (
      <div className="container container-large container-center">
        <Spin/>
      </div>
      );
    }
    const atten = this.state.attendance as Attendance;
    return (
      <div className="container container-large container-center">
        <div>
          <Button onClick={() => this.scanHandler()} size="large" type="primary">扫描</Button>
          {atten &&
            <div style={{marginTop: '16px'}}>
              <p><strong>姓名：</strong>{atten.user.name}</p>
              <p><strong>邮箱：</strong>{atten.user.email}</p>
              <p><strong>电话：</strong>{atten.phone}</p>
              <p><strong>单位：</strong>{atten.user.corporation}</p>              
              <p><strong>职称：</strong>{atten.user.title}</p>              
              <p><strong>职务：</strong>{atten.user.job}</p>
              <p><strong>预计到达时间：</strong>{atten.forecastArriveTime}</p>
              <p><strong>住宿类型：</strong>{atten.stayType}</p> 
              <p><strong>住宿时间：</strong>{this.getStayDateStr(atten)}</p>
              <p><strong>发票抬头：</strong>{atten.invoiceTitle}</p> 
              <p><strong>纳税人识别号：</strong>{atten.taxPayerId}</p> 
              <p><strong>备注：</strong>{atten.remarks}</p>                                    
            </div>
          }
        </div>
      </div>
    );
  }
  
  private getStayDateStr = (atten: Attendance) => {
    let str = '';
    for (const data of atten.stayDates) {
      str += moment(data).format('M月D号') + ' ';
    }
    return str;
  }
  private scanHandler = () => {
    const meetingId = this.props.params.meetingId;
    this.wx.scanQRCode({
      needResult: 1,
      scanType: ['qrCode'],
      success: (res: any) => {
        alert(res.resultStr);
        alert(Urls.checkIn(meetingId, res.resultStr));
        HttpRequestDelegate.get(
          Urls.checkIn(meetingId, res.resultStr),
          true,
          (data: any) => {
            if (data.code === ResponseCode.SUCCESS) {
              message.success('签到成功');
              this.setState({attendance: data.item});
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
