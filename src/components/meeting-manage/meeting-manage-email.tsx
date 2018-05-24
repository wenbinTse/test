import * as React from 'react';
import { Table, Button, Input, Select, Icon, message } from 'antd';
import { User, ResponseCode, Gender } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { browserHistory } from 'react-router';
import { TableRowSelection } from 'antd/lib/table';
import { receiversContainer } from './meeting-manage.css';

const InputGroup = Input.Group;
const Option = Select.Option;
const Search = Input.Search;

class UserTable extends Table<User> {}
class UserColumn extends Table.Column<User> {}

interface Props {
  params: {
    meetingId: string;
  };
}

interface State {
  users: User[];
  field: string;
  loading: boolean;
  selectedRows: User[];
}

class SendEmail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      users: [],
      field: 'name',
      loading: true,
      selectedRows: []
    };
  }

  public componentWillMount() {
    this.search('');
  }

  public render() {
    const rowSelection: TableRowSelection<User> = {
      selectedRowKeys: this.state.selectedRows.map((user) => user._id),
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({selectedRows: selectedRows as User[]});
      }
    };
    return (
      <div>
        <InputGroup compact={true} style={{display: 'flex', maxWidth: '400px', margin: '8px 0'}}>
          <Select style={{ width: '30%' }} defaultValue="name" onChange={(v) => this.setState({field: v as string})}>
            <Option value="name">姓名</Option>
            <Option value="corporation">单位</Option>
            <Option value="title">职称</Option>
            <Option value="job">职务</Option>
          </Select>
          <Search enterButton={true} onSearch={this.search}/>
        </InputGroup>
        <UserTable dataSource={this.state.users} rowSelection={rowSelection} rowKey={(user) => user._id}>
          <UserColumn title="姓名" dataIndex="name"/>
          <UserColumn title="邮箱" dataIndex="email"/>
          <UserColumn title="单位" dataIndex="corporation"/>
          <UserColumn title="职称" dataIndex="title"/>
          <UserColumn title="职务" dataIndex="job"/>
          <UserColumn title="性别" dataIndex="gender" render={(text) => text === Gender.FEMALE ? '女' : '男'}/>
        </UserTable>
          <div className={receiversContainer}>
            <div>收件人</div>
            {this.state.selectedRows.map((user) =>
            <div key={user._id}>
              {user.name}
              <Icon type="close-circle" onClick={() => this.removeReceiver(user)}/>
            </div>)}
          </div>
          <Button style={{margin: 8}} onClick={this.send} disabled={this.state.selectedRows.length === 0} type="primary">发送</Button>
      </div>
    );
  }

  private search = (keyword: string) => {
     HttpRequestDelegate.postJson(
      Urls.getUsersForManagement,
      {
        keyword,
        field: this.state.field
      },
      true,
      (data) => {
        this.setState({loading: false});
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            users: data.list
          });
        } else {
          browserHistory.push('/NotFound');
        }
      }
    );
  }

  private removeReceiver = (user: User) => {
    this.setState({selectedRows: this.state.selectedRows.filter((u) => u._id !== user._id)});
  }

  private send = () => {
    HttpRequestDelegate.postJson(
      Urls.sendEmail(this.props.params.meetingId),
      {addressees: this.state.selectedRows},
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('发送成功');
        } else {
          browserHistory.push('/NotFound');
        }
      }
    );
  }
}

export default SendEmail;
