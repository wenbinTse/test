import * as React from 'react';
import { Table, Button, Input, Form, Modal, message } from 'antd';
import { User, ResponseCode, UserType } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import AddMeetingManager from './add-meeting-manager';
import { title } from '../meeting/meeting.css';
import UserService from '../user/user-service';
import { search } from '../meeting-manage/meeting-manage.css';

const confirm = Modal.confirm;
const Search = Input.Search;

class UserTable extends Table<User> {}
class UserColumn extends Table.Column<User> {}

interface Props {
  userType: UserType;
}

interface State {
  users: User[];
}

class Users extends React.Component<Props, State> {
  private allUsers: User[];
  constructor(props: Props) {
    super(props);
    this.state = {
      users: []
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.postJson(
      Urls.getUsers,
      {userType: this.props.userType},
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({users: data.list});
          this.allUsers = data.list;
        }
      }
    );
  }

  public render() {
    return (
      <div>
        {
          this.props.userType === UserType.MEETING_ADMIN &&
          <div style={{height: '60px'}}>
            <AddMeetingManager callback={this.addUser}/>
          </div>
        }
        <Search
          placeholder="关键字"
          size="large"
          onSearch={(keyword) => this.search(keyword)}
          enterButton={true}
          style={{margin: '16px 0', maxWidth: '500px'}}
        />
        <UserTable dataSource={this.state.users}>
          <UserColumn title="id" dataIndex="_id"/>
          <UserColumn title="姓名" dataIndex="name" sorter={(a, b) => this.sorter(a, b, 'name')}/>
          <UserColumn title="邮箱" dataIndex="email" sorter={(a, b) => this.sorter(a, b, 'email')}/>
          <UserColumn
            title="操作"
            render={(text, record) =>
             <Button shape="circle" onClick={() => this.deleteUser(record)} icon="delete" type="danger"/>}
          />
        </UserTable>
      </div>
    );
  }

  public addUser = (user: User) => {
    const users = this.state.users;
    users.unshift(user);
    this.allUsers.unshift(user);
    this.setState({users});
  }

  private deleteUser = (user: User) => {
    confirm({
      title: '确定删除该用户？',
      content: '确定删除该用户？',
      onOk: () => {
        HttpRequestDelegate.get(
          Urls.deleteUser(user._id),
          true,
          (data) => {
            if (data.code === ResponseCode.SUCCESS) {
              message.success('删除成功');
              this.setState({users: this.state.users.filter((value) => value._id !== user._id)});
              this.allUsers = this.allUsers.filter((value) => value._id !== user._id)
            } else if (data.code === ResponseCode.UNLOGIN) {
              UserService.requireLogin();
            }
          }
        );
      }
    });
  }

  private sorter = (a: User, b: User, field: string) => {
    // tslint:disable-next-line:no-string-literal
    if (a[field] >= b[field]) {
      return 1;
    }
    return -1;
  }

  private search = (keyword: string) => {
    const list = [];
    const reg: RegExp = new RegExp(keyword, 'gi');
    for (const user of this.allUsers) {
      if (user.name.search(reg) >= 0 || user.email.search(reg) >= 0) {
        list.push(user);
      }
    }
    this.setState({users: list});
  }
}

export default Users;
