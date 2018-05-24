import * as React from 'react';
import { Form, Spin, Upload, Button, Icon, message, Popconfirm } from 'antd';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode } from '../../interface';
import * as Styles from './meeting-manage.css';
import UserService from '../user/user-service';
import { browserHistory } from 'react-router';

interface Props {
  params: {
    meetingId: string;
  };
}

interface State {
  images: string[];
  ids: string[];
  loading: boolean;
}

class MeetingManageImage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      images: [],
      ids: [],
      loading: true
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.meetingImages(this.props.params.meetingId),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            loading: false,
            ids: data.ids,
            images: data.list
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
      <section className={Styles.images}>
        {this.renderUpload()}
        {this.state.images.map(this.renderItem)}
      </section>
    );
  }

  public renderUpload = () => {
    return (
      <div>
        <Upload beforeUpload={this.upload} accept="image/*">
          <Button type="primary" size="large">
            <Icon type="plus"/>
            上传
          </Button>
        </Upload>
      </div>
    );
  }

  public upload = (file: any) => {
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error('图像应该小于10MB!');
      return false;
    }
    const formData = new FormData();
    formData.append('file', file);
    HttpRequestDelegate.postFormDate(
      Urls.uploadMeetingImage(this.props.params.meetingId),
      formData,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('上传成功');
          this.setState({
            images: this.state.images.concat(data.item),
            ids: this.state.ids.concat(data.id)
          });
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
    return false;
  }

  public renderItem = (image: string, index: number) => {
    return (
      <div>
        <img src={image}/>
        <div>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => this.deleteImage(index)}
          >
            <Button type="danger">删除</Button>
          </Popconfirm>
        </div>
      </div>
    );
  }

  private deleteImage = (index: number) => {
    HttpRequestDelegate.get(
      Urls.deleteMeetingImage(this.props.params.meetingId, this.state.ids[index]),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          const images = this.state.images;
          images.splice(index, 1);
          const ids = this.state.ids;
          ids.splice(index, 1);
          this.setState({
            images,
            ids
          });
        }
      }
    );
  }
}

export default MeetingManageImage;
