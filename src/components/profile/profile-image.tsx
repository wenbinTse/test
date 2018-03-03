import * as React from 'react';
import { Button, Upload, message } from 'antd';
import * as Styles from './profile.css';
import { UploadFile } from 'antd/lib/upload/interface';
import Urls from '../../urls';
import HttpRequestDelegate from '../../http-request-delegate';
import { ResponseCode } from '../../interface';
import UserService from '../user/user-service';

interface Props {
  name: string;
  profileImageSrc: string;
}

interface State {
  profileImageSrc: string;
}

class ProfileImage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      profileImageSrc: props.profileImageSrc
    };
  }

  public render() {
    const formatName = this.props.name ? this.props.name[0] : '';
    return (
      <div className={Styles.profileImage}>
        {this.state.profileImageSrc ?
        <img src={this.state.profileImageSrc}/> :
        <div className="name">{formatName}</div>}
        <div className="cover">
          <Upload
            accept="image/*"
            action={Urls.editProfileImage}
            showUploadList={false}
            beforeUpload={this.beforeUpload}
          >
            <Button>
              更改
            </Button>
          </Upload>
        </div>
      </div>
    );
  }

  private beforeUpload = (file: UploadFile) => {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
    return false;
  }
  this.submitHandler(file);
  return false;
}

  private submitHandler = (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    HttpRequestDelegate.postFormDate(
      Urls.editProfileImage,
      formData,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('成功');
          this.setState({profileImageSrc: data.item});
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }
}

export default ProfileImage;
