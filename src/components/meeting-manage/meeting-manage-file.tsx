import * as React from 'react';
import { Modal, Table, Spin, Upload, Button, Icon, message } from 'antd';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode, FileObject } from '../../interface';
import UserService from '../user/user-service';
import * as moment from 'moment';
import { browserHistory } from 'react-router';

const { Column } = Table;
const confirm = Modal.confirm;

interface Props {
  params: {
    meetingId: string;
  };
}

interface State {
  files: FileObject[];
  loading: boolean;
}

class FileTable extends Table<FileObject> {}
// tslint:disable-next-line:max-classes-per-file
class FileColumn extends Table.Column<FileObject> {}

// tslint:disable-next-line:max-classes-per-file
class MeetingManageFile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      files: [],
      loading: true
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.meetingFiles(this.props.params.meetingId),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            loading: false,
            files: data.list
          });
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        } else {
          browserHistory.push('/NotFound');
        }
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px'}}>
          <Spin size="large"/>
        </div>
      );
    }
    return (
      <section>
        {this.renderUpload()}
        <FileTable dataSource={this.state.files} rowKey={(record) => record.id} pagination={false}>
          <FileColumn
            title="文件名"
            dataIndex="name" 
            key="name"
            render={(text, record) => <a href={Urls.download(record.id, record.name)}>{text}</a>}
          />
          <Column title="类型" dataIndex="fileType" key="fileType"/>
          <FileColumn 
            title="大小" 
            dataIndex="size" 
            key="size"
            render={(text, record) => <span>{Math.round(record.size / 1000) + 'kb'}</span>}
          />
          <FileColumn 
            title="上传时间" 
            dataIndex="createdDate" 
            key="time"
            render={(text, record) => <span>{moment(record.createdDate).format('YYYY/M/D h:m')}</span>}
          />
          <FileColumn
            title=""
            key="action"
            render={(text, record, index) =>
              <Button icon="delete" shape="circle" type="danger" onClick={() => this.deleteHandler(record, index)}/>}
          />
        </FileTable>
      </section>
    );
  }

  private renderUpload = () => {
    return (
      <div>
        <Upload beforeUpload={this.upload}>
          <Button type="primary" size="large">
            <Icon type="plus"/>
            上传
          </Button>
        </Upload>
      </div>
    );
  }

  private upload = (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    HttpRequestDelegate.postFormDate(
      Urls.uploadMeetingFile(this.props.params.meetingId),
      formData,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('上传成功');
          this.setState({
            files: this.state.files.concat(data.item)
          });
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
    return false;
  }

  private deleteHandler = (record: FileObject, index: number) => {
    const meetingId = this.props.params.meetingId;
    confirm({
      title: '确认删除',
      content: '是否确认删除该文件',
      onOk:  () => {
        HttpRequestDelegate.get(
          Urls.deleteMeetingFile(meetingId, record.id),
          true,
          (data) => {
            if (data.code === ResponseCode.SUCCESS) {
              const files = this.state.files;
              files.splice(index, 1);
              this.setState({
                files
              });
            }
          }
        );
      }
    });
  }
}

export default MeetingManageFile;
