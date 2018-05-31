import * as React from 'react';
import { Meeting, ResponseCode } from '../../interface';
import { Table, Input, Spin, Icon, Button, Popconfirm, message } from 'antd';
import * as moment from 'moment';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import UserService from '../user/user-service';
import { search, width } from '../meeting-manage/meeting-manage.css';
import FeaturedMeetings from '../meeting/featured-meetings';
import { browserHistory } from 'react-router';
import { loading } from '../user/user.css';

const Search = Input.Search;

interface State {
  meetings: Meeting[];
  featuredMeetings: Meeting[];
  loading: boolean;
}

class MeetingTable extends Table<Meeting> {}
class MeetingColumn extends Table.Column<Meeting> {}

class MeetingsForAdmin extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      meetings: [],
      featuredMeetings: [],
      loading: true
    };
  }

  private allMeetings: Meeting[];

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.getMeetingsADMIN,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            meetings: data.meetings,
            featuredMeetings: data.featuredMeetings,
            loading: false
          });
          this.allMeetings = data.meetings.concat();
        } else if (data.code === ResponseCode.SUCCESS) {
          UserService.requireLogin();
        } else if (data.code === ResponseCode.ACCESS_DENIED) {
          browserHistory.push('/NotFound');
        }
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
          <Spin style={{margin: '16px'}} size="large"/>
        </div>
      );
    }
    return (
      <div>
        <h3>首页推荐会议</h3>
        <MeetingTable dataSource={this.state.featuredMeetings}>
          <MeetingColumn
            title="会议名"
            dataIndex={name}
            render={(text, record) => <a href={'/meeting/' + record._id}>{record.name}</a>}
          />
          <MeetingColumn
            title="开始时间"
            dataIndex="startDate"
            render={(text, record) => moment(record.startDate).format('YYYY/M/D')}
          />
          <MeetingColumn
            title="结束时间"
            dataIndex="endDate"
            render={(text, record) => moment(record.endDate).format('YYYY/M/D')}
          />
          <MeetingColumn
            title="管理员"
            dataIndex="owner.name"
          />
          <MeetingColumn
            render={(text, record) =>
              <Popconfirm title="确定要从首页推荐会议中删除？" onConfirm={() => this.deleteFeaturedMeeting(record)}>
                 <Button type="danger" icon="delete" shape="circle"/>
              </Popconfirm>}
          />
        </MeetingTable>
        <h3>所有会议</h3>
        <Search
          placeholder="关键字"
          style={{marginBottom: '16px', maxWidth: '500px'}} 
          size="large"
          enterButton={true}
        />
        <MeetingTable dataSource={this.state.meetings}>
          <MeetingColumn
            title="会议名"
            dataIndex={name}
            render={(text, record) => <a href={'/meeting/' + record._id}>{record.name}</a>}
          />
          <MeetingColumn
            title="开始时间"
            dataIndex="startDate"
            render={(text, record) => moment(record.startDate).format('YYYY/M/D')}
          />
          <MeetingColumn
            title="结束时间"
            dataIndex="endDate"
            render={(text, record) => moment(record.endDate).format('YYYY/M/D')}
          />
          <MeetingColumn
            title="管理员"
            dataIndex="owner.name"
          />
          <MeetingColumn
            render={(text, record) => <Button icon="plus" shape="circle" onClick={() => this.addFeaturedMeeting(record)}/>}
          />
        </MeetingTable>
      </div>
    );
  }

  private search = (keyword: string) => {
    const reg = new RegExp(keyword, 'i');
    const list = [];
    for (const meeting of this.allMeetings) {
      if (meeting.name.search(reg) >= 0 || meeting.owner.name.search(reg) >= 0) {
        list.push(meeting);
      }
    }
    this.setState({meetings: list});
  }

  private deleteFeaturedMeeting = (meeting: Meeting) => {
    HttpRequestDelegate.get(
      Urls.deleteFeaturedMeeting(meeting._id),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('移除成功');
          const meetings = this.state.meetings;
          meetings.unshift(meeting);
          this.setState({
            meetings,
            featuredMeetings: this.state.featuredMeetings.filter((v) => v._id !== meeting._id)
          });
          this.allMeetings.unshift(meeting);
        } else {
          message.warn('异常');
        }
      }
    );
  }

  private addFeaturedMeeting = (meeting: Meeting) => {
    HttpRequestDelegate.get(
      Urls.addFeaturedMeeting(meeting._id),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('添加成功');
          const featuredMeetings = this.state.featuredMeetings;
          featuredMeetings.unshift(meeting);
          this.setState({
            meetings: this.state.meetings.filter((v) => v._id !== meeting._id),
            featuredMeetings
          });
          this.allMeetings = this.allMeetings.filter((v) => v._id !== meeting._id);
        } else {
          message.warn('异常');
        }
      }
    );
  }
}

export default MeetingsForAdmin;
