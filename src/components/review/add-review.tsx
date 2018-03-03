import * as React from 'react';
import { Avatar, Button, Input, message } from 'antd';
import UserService from '../user/user-service';
import * as Styles from './review.css';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode, Review } from '../../interface';
const { TextArea } = Input;

interface Props {
  type: 'review' | 'reply';
  meetingId?: string;
  reviewId?: string;
  successCallback: (review: Review) => void;
}

interface State {
  typing: boolean;
  content: string;
  adding: boolean;
}

class AddReview extends React.Component<Props, State> {
  private user = UserService.getUserProfile();
  private wholeName: string;
  private form: HTMLFormElement;
  constructor(props: Props) {
    super(props);
    this.state = {
      typing: false,
      content: '',
      adding: false
    };
    this.wholeName = this.user.name;
    for (const meeting of this.user.meetings) {
      if (meeting._id === props.meetingId) {
        this.wholeName = '管理员';
        break;
      }
    }
    console.log(this.user)
  }
  
  public render() {
    const name = this.wholeName ? this.wholeName.substr(0, 1) : '';
    const profileImageSrc = this.user.profileImageSrc;

    const style = this.state.typing ? {} : {display: 'none'};

    return (
      <div className={Styles.addContainer}>
        <Avatar src={profileImageSrc} size="large" style={{background: '#40a9ff'}}>{name}</Avatar>
        <form ref={(e) => this.form = e as HTMLFormElement}>
          <TextArea
            placeholder="发表公开留言"
            autosize={true}
            onFocus={() => this.setState({typing: true})}
            value={this.state.content}
            onChange={(e) => this.setState({content: e.target.value})}
            required={true}
          />
          <div className={Styles.buttonContainer} style={style}>
            <Button
              type="primary"
              loading={this.state.adding}
              onClick={this.submitHandler}
            >
              {this.props.type === 'review' ? '留言' : '回复'}
            </Button>
            <Button onClick={() => this.setState({typing: false})}>取消</Button>
          </div>
        </form>
      </div>
    );
  }

  private submitHandler = (e: any) => {
    e.preventDefault();
    if (!this.form.reportValidity()) {
      return;
    }
    this.setState({adding: true});
    const body: any = {
      type: this.props.type,
      meetingId: this.props.meetingId,
      content: this.state.content,
      replyTo: this.props.reviewId
    };
    HttpRequestDelegate.postJson(
      Urls.addReview,
      body,
      true,
      (data) => {
        this.setState({adding: false});
        if (data.code === ResponseCode.SUCCESS) {
          message.success('留言成功');
          this.props.successCallback(data.item);
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        } else {
          message.error('稍后再试');
        }
      }
    );
  }
}

export = AddReview;
