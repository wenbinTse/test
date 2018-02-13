import * as React from 'react';
import { Avatar, Button, Input } from 'antd';
import UserService from '../user/user-service';
import * as Styles from './review.css';
const { TextArea } = Input;

interface Props {
  type: 'review' | 'reply';
  meetingId: string;
}

interface State {
  typing: boolean;
}

class AddReview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      typing: false
    };
  }
  
  public render() {
    const user = UserService.getUserProfile();
    const wholeName = user.name;
    const name = wholeName ? wholeName.substr(0, 1) : '';
    const profileImageSrc = user.profileImageSrc;

    const style = this.state.typing ? {} : {display: 'none'};

    return (
      <div className={Styles.addContainer}>
        <Avatar src={profileImageSrc} size="large">{name}</Avatar>
        <form>
          <TextArea placeholder="发表公开留言" autosize={true} onFocus={() => this.setState({typing: true})}/>
          <div className={Styles.buttonContainer} style={style}>
            <Button type="primary">{this.props.type === 'review' ? '留言' : '回复'}</Button>
            <Button onClick={() => this.setState({typing: false})}>取消</Button>
          </div>
        </form>
      </div>
    );
  }
}

export = AddReview;
