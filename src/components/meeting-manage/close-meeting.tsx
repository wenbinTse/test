import * as React from 'react';
import { Popconfirm, message, Button } from 'antd';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode } from '../../interface';
import { browserHistory } from 'react-router';
import UserService from '../user/user-service';
import { closeMeeting } from './meeting-manage.css';

interface Props {
  params: {
    meetingId: string
  };
}

class CloseMeeting extends React.Component<Props, {}> {
  public render() {
    return (
      <div className={closeMeeting}>
        <Popconfirm title="是否确认关闭删除该会议？该操作不可撤回" onConfirm={this.confrimHandler}>
          <Button type="danger" size="large">关闭</Button>
        </Popconfirm>
      </div>
    );
  }

  private confrimHandler = () => {
    HttpRequestDelegate.get(
      Urls.closeMeeting(this.props.params.meetingId),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('关闭会议成功');
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        } else {
          browserHistory.push('/NotFound');
        }
      }
    );
  }
}

export default CloseMeeting;
