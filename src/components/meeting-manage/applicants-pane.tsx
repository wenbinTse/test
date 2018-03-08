import * as React from 'react';
import { AttendanceStatus, Attendance, ResponseCode } from '../../interface';
import { Table, Button, message, Input } from 'antd';  
import * as Styles from './meeting-manage.css';
import * as moment from 'moment';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import UserService from '../user/user-service';
import { TableRowSelection } from 'antd/lib/table';

const Search = Input.Search;

interface Props {
  status: AttendanceStatus;
  showList: Attendance[];
  allList: Attendance[];
  updateShowList: (list: Attendance[]) => void;
  refuse?: (deletedIds: string[]) => void;
  agree?: (auditedIds: string[]) => void;
  meetingId: string;
}

interface State {
  selectedRowKeys: string[];
}

class AttendanceTable extends Table<Attendance> {}
// tslint:disable-next-line:max-classes-per-file
class AttendanceColumn extends Table.Column<Attendance> {}

// tslint:disable-next-line:max-classes-per-file
class ApplicantsPane extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: []
    };
  }

  public render() {
    const rowSelection: TableRowSelection<Attendance> = {
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
          onSearch={(keyword) => this.search(keyword)}
          enterButton={true}
        />
        {this.props.status === AttendanceStatus.PENDING &&
        <div style={{marginBottom: '16px'}}>
          <Button onClick={() => this.auditAttendance()} type="primary">同意</Button>
          <Button onClick={() => this.refuseAttendance()} style={{marginLeft: '16px'}} type="primary">拒绝</Button>
        </div>}
        <AttendanceTable dataSource={this.props.showList} rowKey={(record) => record._id} rowSelection={rowSelection} scroll={{x: '800'}} className={Styles.applicantsContainer}>
          <AttendanceColumn title="姓名" dataIndex="user.name" key="name" width={80} fixed="left" sorter={(a, b) => this.sorter(a, b, 'name')}/>
          <AttendanceColumn title="邮箱" dataIndex="user.email" key="email" sorter={(a, b) => this.sorter(a, b, 'email')}/>
          <AttendanceColumn title="phone" dataIndex="phone" sorter={(a, b) => this.directSorter(a, b, 'phone')}/>
          <AttendanceColumn title="单位" dataIndex="user.corporation" key="corporation" sorter={(a, b) => this.sorter(a, b, 'corporation')}/>
          <AttendanceColumn
            title="职称/职务"
            dataIndex="user.title" 
            key="title"
            sorter={(a, b) => this.sorter(a, b, 'title')}
            render={(text, record) => record.user.title + ' ' + record.user.job}
          />
          <AttendanceColumn title="纳税人识别号" dataIndex="taxPayerId" key="taxPayerId" sorter={(a, b) => this.directSorter(a, b, 'taxPayerId')}/>
          <AttendanceColumn title="发票抬头" dataIndex="invoiceTitle" key="invoiceTitle" sorter={(a, b) => this.directSorter(a, b, 'invoiceTitle')}/>
          <AttendanceColumn title="住宿类型" dataIndex="stayType" key="stayType" sorter={(a, b) => this.directSorter(a, b, 'stayType')}/>
          <AttendanceColumn 
            title="住宿日期"
            dataIndex="stayDates"
            key="stayDates"
            render={(text, record) => record.stayDates.map((data) => moment(data).format('M月D号') + ', ')}
          />
          <AttendanceColumn title="预计到达时间" dataIndex="forecastArriveTime" key="forecastArriveTime"/>
          <AttendanceColumn title="备注" dataIndex="remarks" key="remarks"/>
          <AttendanceColumn 
            title="注册时间" 
            dataIndex="createdDate"
            render={(text, record) => moment(record.createdDate).format('M月D号 H:mm')}
            sorter={(a, b) => this.directSorter(a, b, 'createdDate')}
          />
          {this.props.status === AttendanceStatus.PENDING && <AttendanceColumn 
            title="操作" 
            key="operations"
            width={100}
            fixed="right"
            render={(text, record) => this.props.status === AttendanceStatus.PENDING ?
              <div>
                <Button onClick={() => this.auditAttendance(record._id)}>同意</Button> 
                <Button style={{marginLeft: '8px'}} onClick={() => this.refuseAttendance(record._id)}>拒绝</Button> 
              </div>
            : null}
          />}
        </AttendanceTable>
      </div>
    );
  }
  private sorter = (a: Attendance, b: Attendance, field: string) => {
    // tslint:disable-next-line:no-string-literal
    if (a.user[field] > b.user[field]) {
      return 1;
    }
    return -1;
  }

  private directSorter = (a: Attendance, b: Attendance, field: string) => {
    if (a[field] > b[field]) {
      return 1;
    }
    return -1;
  }

  private search = (keyword: string) => {
    const reg: RegExp = new RegExp(keyword, 'gi');
    const list: Attendance[] = [];
    for (const item of this.props.allList) {
      if (item.user.name.search(reg) >= 0 || item.user.corporation.search(reg) >= 0 ||
        item.user.title.search(reg) >= 0 || (item.user.job && item.user.job.search(reg) >= 0)) {
        list.push(item);
      }
    }
    this.props.updateShowList(list);
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
      Urls.auditAttendance(this.props.meetingId),
      {attenIds: idList},
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('操作成功');
          this.setState({
            selectedRowKeys: this.state.selectedRowKeys.filter((value) => !this.find(value, idList)),
          });
          (this.props.agree as (added: string[]) => void)(idList);
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
      Urls.refuseAttendance(this.props.meetingId),
      {attenIds: idList},
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('操作成功');
          this.setState({
            selectedRowKeys: this.state.selectedRowKeys.filter((value) => !this.find(value, idList))
          });
          (this.props.refuse as (refued: string[]) => void)(idList);
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }
}

export default ApplicantsPane;
