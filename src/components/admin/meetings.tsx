import * as React from 'react';
import { Meeting, ResponseCode } from '../../interface';
import { Table, Input } from 'antd';
import * as moment from 'moment';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import UserService from '../user/user-service';
import { search } from '../meeting-manage/meeting-manage.css';

const Search = Input.Search;

interface State {
  meetings: Meeting[];
}

class MeetingTable extends Table<Meeting> {}
class MeetingColumn extends Table.Column<Meeting> {}

class MeetingsForAdmin extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      meetings: []
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
            meetings: data.list
          });
          this.allMeetings = data.list;
        } else if (data.code === ResponseCode.SUCCESS) {
          UserService.requireLogin();
        }
      }
    );
  }

  public render() {
    return (
      <div>
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
}

export default MeetingsForAdmin;
