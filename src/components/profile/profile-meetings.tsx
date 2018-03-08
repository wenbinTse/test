import * as React from 'react';
import { Spin, Tabs, Collapse, Modal, Button, message, Badge } from 'antd';  
import { AttendanceStatus, ResponseCode, Attendance } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import UserService from '../user/user-service';
import * as moment from 'moment';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const confirm = Modal.confirm;

interface State {
  loading: boolean;
  pending: Attendance[];
  refused: Attendance[];
  audited: Attendance[];
}

class ProfileMeetings extends React.Component<{}, State> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      loading: true,
      pending: [],
      refused: [],
      audited: []
    };
  }
  
  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.userMeetings,
      true,
      (data) => {
        this.setState({loading: false});
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            pending: data.pending,
            refused: data.refused,
            audited: data.audited
          });
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }

  private renderTab(attendances: Attendance[]) {
    if (!attendances.length) {
      return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', height: '200px'}}>暂无数据</div>
      );
    }
    return (
      <Collapse>
        {attendances.map((atten, index) =>
         this.renderItem(atten, index)
        )}
      </Collapse>
    );
  }

  private renderItem(atten: Attendance, index: number) {
    const meeting = atten.meeting;
    const startDateStr = moment(meeting.startDate).format('MM月DD号');
    const endDateStr = moment(meeting.endDate).format('MM月DD号');
    const address = meeting.location.province + meeting.location.city + meeting.location.address;

    const header = (
      <div>
        <a href={'/meeting/' + meeting._id}>{atten.meeting.name}</a>
        {atten.status !== AttendanceStatus.AUDITED &&
         <Button icon="delete" shape="circle" type="danger" style={{marginLeft: '16px'}} onClick={() => this.showConfirmModal(atten)}/>}
      </div>
    );

    return (
      <Panel key={meeting._id} header={header}>
        <p><strong>举办时间：</strong>{startDateStr} - {endDateStr}</p>
        <p><strong>举办地点：</strong>{address}</p>
        <p><strong>个人纳税号：</strong>{atten.taxPayerId}</p>
        <p><strong>发票抬头：</strong>{atten.invoiceTitle}</p>
        <p><strong>手机号：</strong>{atten.phone}</p>        
        <p><strong>预计到达时间：</strong>{atten.forecastArriveTime}</p>
        {atten.stayType && <p><strong>住宿类型：</strong>{atten.stayType}</p>}
        {atten.stayDates.length > 0 &&
         <p><strong>住宿日期：</strong> {
          atten.stayDates.map((date) => moment(date).format('MM月DD号'))
        },</p>}
        <p><strong>备注：</strong>{atten.remarks}</p>
      </Panel>
    );
  }

  private showConfirmModal = (atten: Attendance) => {
    confirm({
      title: '确认取消注册该会议？',
      content: '您是否确认取消注册该会议？该操作不可撤回。',
      onOk: () => this.cancelAtten(atten),
    });
  }

  private cancelAtten = (atten: Attendance) => {
    HttpRequestDelegate.get(
      Urls.cancelAttendance(atten._id),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('成功取消');
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px'}}>
          <Spin size="large"/>
        </div>
      );
    }
    return (
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <Badge count={this.state.audited.length}>
              <span>yitongguoshenhe</span>
            </Badge>}
          key={1}
        >
          {this.renderTab(this.state.audited)}
        </TabPane>
        <TabPane
          tab={
            <Badge count={this.state.pending.length}>
              <span>yitongguoshenhe</span>
            </Badge>}
          key={2}
        >
          {this.renderTab(this.state.pending)}
        </TabPane>
        <TabPane
          tab={
            <Badge count={this.state.refused.length}>
              <span>yitongguoshenhe</span>
            </Badge>}
          key={3}
        >
          {this.renderTab(this.state.refused)}
        </TabPane>
      </Tabs>
    );
  }
}

export default ProfileMeetings;
