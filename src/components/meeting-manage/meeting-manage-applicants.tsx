import * as React from 'react';
import { Spin, Tabs, Table, Button, Input, message } from 'antd';  
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode, Attandence, AttendanceStatus } from '../../interface';
import * as moment from 'moment';
import UserService from '../user/user-service';
import { browserHistory } from 'react-router';
import { TableRowSelection } from 'antd/lib/table';
import * as Styles from './meeting-manage.css';

const TabPane = Tabs.TabPane;
const Search = Input.Search;

interface Props {
  params: {
    meetingId: string
  };
}

interface State {
  loading: boolean;
  pending: Attandence[];
  audited: Attandence[];
  selectedRowKeys: string[];
}

class AttandenceTable extends Table<Attandence> {}
// tslint:disable-next-line:max-classes-per-file
class AttandenceColumn extends Table.Column<Attandence> {}

// tslint:disable-next-line:max-classes-per-file
class MeetingApplicants extends React.Component<Props, State> {
  private allPending: Attandence[];
  private allAudited: Attandence[];
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      pending: [],
      audited: [],
      selectedRowKeys: []
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.meetingApplicants(this.props.params.meetingId),
      true,
      (data) => {
        this.setState({loading: false});
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            pending: data.pending,
            audited: data.audited
          });
          this.allAudited = data.audited;
          this.allPending = data.pending;
        } else if (data.code === ResponseCode.UNLOGIN) {
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
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px'}}>
          <Spin size="large"/>
        </div>
      );
    }
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="已通过审核" key={1}>
          {this.renderTab(this.state.audited, AttendanceStatus.AUDITED)}
        </TabPane>
        <TabPane tab="未审核" key={2}>
          {this.renderTab(this.state.pending, AttendanceStatus.PENDING)}
        </TabPane>
      </Tabs>
    );
  }

  private sorter = (a: Attandence, b: Attandence, field: string) => {
    // tslint:disable-next-line:no-string-literal
    if (a.user[field] > b.user[field]) {
      return 1;
    }
    return -1;
  }

  private directSorter = (a: Attandence, b: Attandence, field: string) => {
    if (a[field] > b[field]) {
      return 1;
    }
    return -1;
  }

  private search = (keyword: string, status: AttendanceStatus) => {
    // this.setState({selectedRowKeys: []});
    const all = status === AttendanceStatus.PENDING ? this.allPending : this.allAudited;
    const reg: RegExp = new RegExp(keyword, 'gi');
    const list: Attandence[] = [];
    for (const item of all) {
      if (item.user.name.search(reg) >= 0) {
        list.push(item);
      }
    }
    if (status === AttendanceStatus.PENDING) {
      this.setState({pending: list});
    } else {
      this.setState({audited: list});
    }
  }

  private renderTab(attens: Attandence[], status: AttendanceStatus) {
    const rowSelection: TableRowSelection<Attandence> = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys: selectedRowKeys as string[]});
      }
    };
    return (
      <div>
        <Search
          className={Styles.search}
          placeholder="关键字"
          onSearch={(keyword) => this.search(keyword, status)}
          enterButton={true}
        />
        {status === AttendanceStatus.PENDING &&
        <div style={{marginBottom: '16px'}}>
          <Button onClick={() => this.auditAttendance()} type="primary">同意</Button>
          <Button onClick={() => this.refuseAttendance()} style={{marginLeft: '16px'}} type="primary">拒绝</Button>
        </div>}
        <AttandenceTable dataSource={attens} rowKey={(record) => record._id} rowSelection={rowSelection} scroll={{x: '800'}} className={Styles.applicantsContainer}>
          <AttandenceColumn title="姓名" dataIndex="user.name" key="name" width={80} fixed="left" sorter={(a, b) => this.sorter(a, b, 'name')}/>
          <AttandenceColumn title="邮箱" dataIndex="user.email" key="email" sorter={(a, b) => this.sorter(a, b, 'email')}/>
          <AttandenceColumn title="单位" dataIndex="user.corporation" key="corporation" sorter={(a, b) => this.sorter(a, b, 'corporation')}/>
          <AttandenceColumn
            title="职称/职务"
            dataIndex="user.title" 
            key="title"
            sorter={(a, b) => this.sorter(a, b, 'title')}
            render={(text, record) => record.user.title + ' ' + record.user.job}
          />
          <AttandenceColumn title="纳税人识别号" dataIndex="taxPayerId" key="taxPayerId" sorter={(a, b) => this.directSorter(a, b, 'taxPayerId')}/>
          <AttandenceColumn title="发票抬头" dataIndex="invoiceTitle" key="invoiceTitle" sorter={(a, b) => this.directSorter(a, b, 'invoiceTitle')}/>
          <AttandenceColumn title="住宿类型" dataIndex="stayType" key="stayType" sorter={(a, b) => this.directSorter(a, b, 'stayType')}/>
          <AttandenceColumn 
            title="住宿日期"
            dataIndex="stayDates"
            key="stayDates"
            render={(text, record) => record.stayDates.map((data) => moment(data).format('M月D号') + ', ')}
          />
          <AttandenceColumn title="预计到达时间" dataIndex="forecastArriveTime" key="forecastArriveTime"/>
          <AttandenceColumn title="备注" dataIndex="remarks" key="remarks"/>
          <AttandenceColumn 
            title="注册时间" 
            dataIndex="createdDate"
            render={(text, record) => moment(record.createdDate).format('M月D号 H:mm')}
            sorter={(a, b) => this.directSorter(a, b, 'createdDate')}
          />
          {status === AttendanceStatus.PENDING && <AttandenceColumn 
            title="操作" 
            key="operations"
            width={100}
            fixed="right"
            render={(text, record) => status === AttendanceStatus.PENDING ?
              <div>
                <Button onClick={() => this.auditAttendance(record._id)}>同意</Button> 
                <Button style={{marginLeft: '8px'}} onClick={() => this.refuseAttendance(record._id)}>拒绝</Button> 
              </div>
            : null}
          />}
        </AttandenceTable>
      </div>
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

  private auditAttendance = (attenId?: string) => {
    if (!attenId && !this.state.selectedRowKeys.length) {
      message.warn('没有选择任何项');
      return;
    }
    const idList = attenId ? [attenId] : this.state.selectedRowKeys;
    HttpRequestDelegate.postJson(
      Urls.auditAttendance(this.props.params.meetingId),
      {attenIds: idList},
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('操作成功');
          const oldPending = this.state.pending;
          this.setState({
            pending: oldPending.filter((value) => !this.find(value._id, idList)),
            selectedRowKeys: this.state.selectedRowKeys.filter((value) => !this.find(value, idList)),
            audited: this.state.audited.concat(oldPending.filter((value) => this.find(value._id, idList)))
          });
          this.allPending = this.allPending.filter((value) => !this.find(value._id, idList));
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }

  private refuseAttendance = (attenId?: string) => {
    if (!attenId && !this.state.selectedRowKeys.length) {
      message.warn('没有选择任何项');
      return;
    }
    const idList = attenId ? [attenId] : this.state.selectedRowKeys;
    HttpRequestDelegate.postJson(
      Urls.refuseAttendance(this.props.params.meetingId),
      {attenIds: idList},
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('操作成功');
          const oldPending = this.state.pending;
          this.setState({
            pending: oldPending.filter((value) => !this.find(value._id, idList)),
            selectedRowKeys: this.state.selectedRowKeys.filter((value) => !this.find(value, idList))
          });
          this.allPending = this.allPending.filter((value) => !this.find(value._id, idList));
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }
}

export default MeetingApplicants;
