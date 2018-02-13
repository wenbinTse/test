import * as React from 'react';
import { List, Spin } from 'antd';
import { ResponseCode, Review } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import ReviewElement = require('./review');
import AddReview = require('./add-review');

interface Props {
  meetingId?: string;
  reviewId?: string;
  type: 'review' | 'reply';
}

interface State {
  reviews: Review[];
  loading: boolean;
}

class Reviews extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      reviews: [],
      loading: true
    };
  }

  public componentWillMount() {
    const url = this.props.type === 'review' ? Urls.getReviews(this.props.meetingId as string) :
      Urls.getReplies(this.props.reviewId as string);

    HttpRequestDelegate.get(
      url,
      false,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            reviews: data.list,
            loading: false
          });
        }
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px'}}>
          <Spin size="large"/>
        </div>
      );
    }

    const style = {maxWidth: '1024px'};

    const status: string = this.props.type === 'review' ? '暂时没人留言' : '暂时没人回复';

    if (!this.state.reviews.length) {
      return (
        <div style={style}>
          <AddReview type={this.props.type} meetingId={this.props.meetingId} reviewId={this.props.reviewId} successCallback={this.addReview}/>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px'}}>
            <span style={{fontSize: '18px', fontWeight: 'bold'}}>{status}</span>
          </div>
        </div>
      );
    }

    return (
      <div style={style}>
        <AddReview type={this.props.type} meetingId={this.props.meetingId} reviewId={this.props.reviewId} successCallback={this.addReview}/>
        <List
          itemLayout="horizontal"
          dataSource={this.state.reviews}
          renderItem={(item: Review, index: number) => <ReviewElement review={item} index={index} type={this.props.type}/>}
        />
      </div>
    );
  }

  private addReview = (review: Review) => {
    const reviews = this.state.reviews;
    reviews.unshift(review);
    this.setState({reviews});
  }
}

export default Reviews;
