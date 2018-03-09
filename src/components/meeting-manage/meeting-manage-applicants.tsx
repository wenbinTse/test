import * as React from 'react';
import { Spin, Tabs, Badge } from 'antd';  
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode, Attendance, AttendanceStatus } from '../../interface';
import UserService from '../user/user-service';
import { browserHistory } from 'react-router';
import ApplicantsPane from './applicants-pane';

const TabPane = Tabs.TabPane;

interface Props {
  params: {
    meetingId: string
  };
}

interface State {
  loading: boolean;
  pending: Attendance[];
  audited: Attendance[];
  allPending: Attendance[];
  allAudited: Attendance[];
}

class MeetingApplicants extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      pending: [],
      audited: [],
      allPending: [],
      allAudited: []
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.meetingApplicants(this.props.params.meetingId),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            loading: false,
            pending: data.pending,
            audited: data.audited,
            allPending: data.pending,
            allAudited: data.audited
          });
        } else {
          if (data.code === ResponseCode.UNLOGIN) {
            UserService.requireLogin();
          } else if (data.code === ResponseCode.ACCESS_DENIED) {
            browserHistory.push('/NotFound');
          }
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
            <Badge count={this.state.allAudited.length}>
              <span>已通过审核</span>
            </Badge>}
          key={1}
        >
          <ApplicantsPane
            meetingId={this.props.params.meetingId}
            status={AttendanceStatus.AUDITED}
            showList={this.state.audited}
            allList={this.state.allAudited}
            updateShowList={(list) => this.updateShowList(list, AttendanceStatus.AUDITED)}
          />
        </TabPane>
        <TabPane
          tab={
            <Badge count={this.state.allPending.length}>
              <span>未审核</span>
            </Badge>}
          key={2}
        >
          <ApplicantsPane
            meetingId={this.props.params.meetingId}
            status={AttendanceStatus.PENDING}
            showList={this.state.pending}
            allList={this.state.allPending}
            updateShowList={(list) => this.updateShowList(list, AttendanceStatus.PENDING)}
            refuse={this.refuse}
            agree={this.agree}
          />
        </TabPane>
      </Tabs>
    );
  }

  private find = (val: string, array: string[]) => {
    for (const item of array) {
      if (val === item) {
        return true;
      }
    }
    return false;
  }

  private agree = (idList: string[]) => {
    const pending = this.state.pending.filter((value) => !this.find(value._id, idList));
    const audited = this.state.audited.concat(this.state.pending.filter((value) => this.find(value._id, idList)));
    const allPending = this.state.allPending.filter((value) => !this.find(value._id, idList));
    const allAudited = this.state.allAudited.concat(this.state.pending.filter((value) => this.find(value._id, idList)));
    this.setState({
      pending,
      audited,
      allPending,
      allAudited
    });
  }

  private refuse = (idList: string[]) => {
    const pending = this.state.pending.filter((value) => !this.find(value._id, idList));
    const allPending = this.state.allPending.filter((value) => !this.find(value._id, idList));
    this.setState({
      pending,
      allPending
    });
  }

  private updateShowList = (list: Attendance[], status: AttendanceStatus) => {
    if (status === AttendanceStatus.AUDITED) {
      this.setState({audited: list});
    } else {
      this.setState({pending: list});
    }
  }
}

export default MeetingApplicants;
