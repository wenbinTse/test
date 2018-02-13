import * as React from 'react';
import { List, Spin } from 'antd';
import { ResponseCode, Review } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import ReviewElement = require('./review');
import AddReview = require('./add-review');

interface Props {
  meetingId: string;
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
    HttpRequestDelegate.get(
      Urls.getReviews(this.props.meetingId),
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

    if (!this.state.reviews.length) {
      return (
        <div style={style}>
          <AddReview type="review" meetingId={this.props.meetingId}/>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px'}}>
            <span style={{fontSize: '18px', fontWeight: 'bold'}}>暂时没人留言</span>
          </div>
        </div>
      );
    }

    return (
      <div style={style}>
        <AddReview type="review" meetingId={this.props.meetingId}/>
        <List
          itemLayout="horizontal"
          dataSource={this.state.reviews}
          renderItem={(item: Review) => <ReviewElement review={item}/>}
        />
      </div>
    );
  }
}

export = Reviews;
