import * as React from 'react';
import { AttendanceStatus, Attendance, ResponseCode, Gender } from '../../interface';
import { Table, Button, message, Input, Modal, Select } from 'antd';  
import * as Styles from './meeting-manage.css';
import * as moment from 'moment';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import UserService from '../user/user-service';
import { TableRowSelection } from 'antd/lib/table';
import ReactHighcharts = require('react-highcharts');
const Search = Input.Search;
const Option = Select.Option;

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
  showModal: boolean;
  chartData: any[];
}

class AttendanceTable extends Table<Attendance> {}
// tslint:disable-next-line:max-classes-per-file
class AttendanceColumn extends Table.Column<Attendance> {}

// tslint:disable-next-line:max-classes-per-file
class ApplicantsPane extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      showModal: false,
      chartData: []
    };
  }

  public componentDidMount() {
    this.updateChartData('corporation');
  }

  public render() {
    const rowSelection: TableRowSelection<Attendance> = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys: selectedRowKeys as string[]});
      }
    };
    const config = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
      },
      title: {
        text: '与会人员信息统计分析'
      },
      tooltip: {
        headerFormat: '{series.name}<br>',
        pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (ReactHighcharts.theme && ReactHighcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        type: 'pie',
        name: '与会人员信息统计分析',
        data: this.state.chartData
      }]
    };
    return (
      <div>
        <Modal
          visible={this.state.showModal}
          className={Styles.chartContainer}
          onCancel={() => this.setState({showModal: false})}
        >
          <div className={Styles.chart}>
            <Select defaultValue="corporation" onChange={this.updateChartData}>
              <Option value="corporation">单位</Option>
              <Option value="title">职称</Option>
              <Option value="gender">性别</Option>
              <Option value="stayType">住宿类型</Option>
              <Option value="invoiceTitle">发票抬头</Option>
            </Select>
            <ReactHighcharts config={config}/>
          </div>
        </Modal>
        <Search
          className={Styles.search}
          placeholder="关键字"
          onSearch={(keyword) => this.search(keyword)}
          enterButton={true}
        />
        <Button href={this.export()} download="数据.csv" onClick={this.exportClickHandler}>导出</Button>
        <div style={{marginBottom: '16px'}}>
          <Button onClick={() => this.setState({showModal: !this.state.showModal})}>可视化</Button>
          {
            this.props.status === AttendanceStatus.PENDING &&
            <Button onClick={() => this.auditAttendance()} type="primary" style={{marginLeft: '16px'}}>同意</Button>
          }
          {
            this.props.status === AttendanceStatus.PENDING &&
            <Button onClick={() => this.refuseAttendance()} style={{marginLeft: '16px'}} type="primary">拒绝</Button>
          }
        </div>
        <AttendanceTable dataSource={this.props.showList} rowKey={(record) => record._id} rowSelection={rowSelection} scroll={{x: '800'}} className={Styles.applicantsContainer}>
          <AttendanceColumn title="姓名" dataIndex="user.name" key="name" width={80} fixed="left" sorter={(a, b) => this.sorter(a, b, 'name')}/>
          <AttendanceColumn
            title="性别"
            dataIndex="user.gender" 
            key="gender"
            sorter={(a, b) => this.sorter(a, b, 'gender')}
            render={(text, record) => record.user.gender === Gender.FEMALE ? '女' : '男'}
          />
          <AttendanceColumn title="邮箱" dataIndex="user.email" key="email" sorter={(a, b) => this.sorter(a, b, 'email')}/>
          <AttendanceColumn title="电话" dataIndex="phone" sorter={(a, b) => this.directSorter(a, b, 'phone')}/>
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
            render={(text, record) => this.getStayDateStr(record)}
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

  private updateChartData = (field: string) => {
    const data = {};
    for (const atten of this.props.allList) {
      let value = '';
      if (field === 'corporation' || field === 'title') {
        value = atten.user[field];
      } else if (field === 'gender') {
        value = atten.user[field] === Gender.FEMALE ? '女' : '男';
      } else {
        value = atten[field];
      }
      if (data[value]) {
        data[value] ++;
      } else {
        data[value] = 1;
      }
    }
    const dataArray: any[] = [];
    // tslint:disable-next-line:forin
    for (const key in data) {
      dataArray.push([key, data[key]]);
    }
    this.setState({chartData: dataArray});
  }

  private getStayDateStr = (atten: Attendance) => {
    let str = '';
    for (const data of atten.stayDates) {
      str += moment(data).format('M月D号') + ' ';
    }
    return str;
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

  private exportClickHandler = (e: any) => {
    if (!this.state.selectedRowKeys.length) {
      message.warn('未选择任何项');
      e.preventDefault();
    }
  }

  private export = () => {
    const BOM = '\uFEFF';
    const attens = this.props.allList.filter((value) => this.find(value._id, this.state.selectedRowKeys));
    let str = '姓名,性别,邮箱,电话,单位,职称,职务,纳税人识别号,发票抬头,住宿类型,住宿日期,注册时间\n';
    for (const atten of attens) {
      const user = atten.user;
      str += user.name + ',' + (user.gender ===　Gender.FEMALE ? '女' : '男')　+ ',' + user.email + ','
        + atten.phone + ',' + user.corporation + ',' + user.title + ',' + user.job + ',' + atten.taxPayerId + ','
        + atten.invoiceTitle + ',' + atten.stayType + ',' + this.getStayDateStr(atten) + ',' + moment(atten.createdDate).format('MM/DD hh:mm') + '\n';
    }
    const csvData = new Blob([BOM + str], {type: 'text/csv'});
    return URL.createObjectURL(csvData);
  }
}

export default ApplicantsPane;
