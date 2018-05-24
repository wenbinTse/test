import * as React from 'react';
import { Avatar, Icon, message } from 'antd';
import { Review, User, UserType, ResponseCode } from '../../interface';
import * as moment from 'moment';
import * as Styles from './review.css';
import Reviews from './reviews';
import UserService from '../user/user-service';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';

interface Props {
  type: 'review' | 'reply';
  review: Review;
  index?: number;
  deleteCallback: (review: Review) => void;
}

interface State {
  replying: boolean;
  showRelies: boolean;
}

class ReviewElement extends React.Component<Props, State> {
  private userProfile: User | null = UserService.getUserProfile();
  constructor(props: Props) {
    super(props);
    this.state = {
      replying: false,
      showRelies: false
    };
  }

  public render() {
    const review = this.props.review;
    const name = review.admin ? '管理员' : review.owner.name;
    const profileName = name ? name.substr(0, 1) : '';
    const time = moment(review.createdDate).format('YY/M/D h:m');
    const style = this.props.index === 0 ? {marginTop: '24px'} : {};

    const spanStyle: React.CSSProperties = {color: 'black', textDecoration: 'underline', cursor: 'pointer'};
    const s1 = !this.state.showRelies ? `显示${review.numOfReply}条回复` : '收起';
    const s2 = !this.state.showRelies ? '回复' : '收起';

    const canDeleted = (this.userProfile && this.userProfile.userType === UserType.MEETING_ADMIN &&
      this.userProfile.meetings.findIndex((x) => x._id === review.meeting) >= 0) || (
        this.userProfile && this.userProfile._id === review.owner._id
      );

    return (
      <div className={Styles.container} style={style}>
        {canDeleted && <Icon type="delete" className={Styles.deleteIcon} onClick={this.deleteHandler}/>}
        <Avatar size="large" src={review.admin ? '' : review.profileImageSrc} style={{background: '#f56a00'}}>
          {profileName}
        </Avatar>
        <div style={{width: '100%'}}>
          <span><strong>{name}: </strong>{review.content}</span>
          <div>
            <span style={{marginRight: '8px'}}>{time}</span>
            {
              this.props.type === 'review' && review.numOfReply !== 0 &&
              <span style={spanStyle} onClick={() => this.setState({showRelies: !this.state.showRelies})}>{s1}</span>
            }
            {
              this.props.type === 'review' && review.numOfReply === 0 &&
                <span style={spanStyle} onClick={() => this.setState({showRelies: !this.state.showRelies})}>{s2}</span>
            }
          </div>
            {this.props.type === 'review' && this.state.showRelies && <Reviews type="reply" reviewId={this.props.review._id} meetingId={this.props.review.meeting}/>}
        </div>
      </div>
    );
  }

  private deleteHandler = () => {
    HttpRequestDelegate.get(
      Urls.deleteReview(this.props.review._id),
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          message.success('删除成功');
          this.props.deleteCallback(this.props.review);
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }
}

export = ReviewElement;
