import * as React from 'react';
import { Avatar } from 'antd';
import { Review } from '../../interface';
import * as moment from 'moment';
import * as Styles from './review.css';
import Reviews from './reviews';

interface Props {
  type: 'review' | 'reply';
  review: Review;
  index?: number;
}

interface State {
  replying: boolean;
  showRelies: boolean;
}

class ReviewElement extends React.Component<Props, State> {
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
    
    return (
      <div className={Styles.container} style={style}>
        <Avatar size="large" src={review.profileImageSrc} style={{background: '#f56a00'}}>
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
}

export = ReviewElement;
