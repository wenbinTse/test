import * as React from 'react';
import { Avatar } from 'antd';
import { Review } from '../../interface';
import * as moment from 'moment';

interface Props {
  review: Review;
}

class ReviewElement extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const review = this.props.review;
    const profileName = review.name ? review.name.substr(0, 1) : '';
    const time = moment(review.createdDate).format('YY/M/D h:m');
    return (
      <div>
        <Avatar size="large" src={review.profileImageSrc}>
          {profileName}
        </Avatar>
        <span>{review.content}</span>
        <span>{time}</span>
      </div>
    );
  }
}

export = ReviewElement;
