import * as React from 'react';
import { Spin, message } from 'antd';
import { Meeting, ResponseCode } from '../interface';
import HttpRequestDelegate from '../http-request-delegate';
import Urls from '../urls';
import MeetingList from './meeting/meeting-list';
import MeetingSearch from './meeting/meeting-search';
import FeaturedMeetings from './meeting/featured-meetings';

interface State {
  meetings: Meeting[];
  featuredMeetings: Meeting[];
  loading: boolean;
  searching: boolean;
}

class Home extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      meetings: [],
      featuredMeetings: [],
      loading: true,
      searching: false
    };
  }
  
  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.dataForHome,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            loading: false,
            meetings: data.meetings,
            featuredMeetings: data.featuredMeetings
          });
        }
      }
    );
  }
  
  public render() {
    if (this.state.loading) {
      return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px'}}>
          <Spin size="large"/>
        </div>
      );
    }
    return (
      <div>
        <FeaturedMeetings meetings={this.state.featuredMeetings}/>
        <div className="container container-large">
          <MeetingSearch onSearch={this.searchHandler}/>
          <MeetingList meetings={this.state.meetings} loading={this.state.searching}/>
        </div>
      </div>
    );
  }

  public searchHandler = (keyword: string) => {
    this.setState({searching: true});
    HttpRequestDelegate.postJson(
      Urls.searchMeeting,
      {keyword},
      true,
      (data) => {
        this.setState({searching: false});
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({meetings: data.list});
        } else {
          message.error('请稍后再试');
        }
      }
    );
  }
}

export = Home;
