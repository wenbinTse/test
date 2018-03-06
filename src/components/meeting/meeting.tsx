import * as React from 'react';
import { Button, Spin, Row, Col, Carousel, Icon, Tabs, Modal } from 'antd';
import { Meeting, ResponseCode } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import * as Styles from './meeting.css';
import * as moment from 'moment';
import GuestElement = require('../guest/guest');
import Reviews from '../review/reviews';
import MeetingRegister = require('./meeting-register');
const TabPane = Tabs.TabPane;

const dateFormat = 'YYYY/M/D';

interface Props {
  params: {
    meetingId: string
  };
}

interface State {
  showRegisterModal: boolean;
  meeting?: Meeting;
  valid: boolean;
}

class MeetingDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showRegisterModal: false,
      valid: true
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.getMeeting(this.props.params.meetingId),
      false,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({meeting: data.item});
        } else if (data.code === ResponseCode.FIND_NOTHING) {
          this.setState({valid: false});
        }
      }
    );
  }
  
  public render() {
    if (!this.state.valid) {
      return <div><h2>没有此会议</h2></div>;
    }
    if (!this.state.meeting) {
      return <Spin size="large" style={{position: 'fixed', left: '48%', top: '48%'}}/>;
    }
    const meeting = this.state.meeting;

    const startMoment = moment(meeting.startDate);
    const endMoment = moment(meeting.endDate);
    const dateString = startMoment.isSame(endMoment, 'day') ?
      startMoment.format(dateFormat) : startMoment.format(dateFormat) + ' - ' + endMoment.format(dateFormat);
    const locationString = meeting.location.province + meeting.location.city + meeting.location.address;

    return (
      <div className="container container-large">
        <Row gutter={24}>
          {meeting.images && meeting.images.length &&
          <Col sm={24} md={14}>
            <Carousel>
              {meeting.images.map((src, index) =>
                <img src={src} key={index} style={{height: '300px'}}/>)
              }
            </Carousel>
          </Col>}
          <Col sm={24} md={10}>
            <div className={Styles.meetingDetailTitle}>
              <h1>{meeting.name}</h1>
              <Icon type="check-circle" style={{color: 'green'}}/>
            </div>
            <div style={{display: 'flex'}}>
              <div className={Styles.meetingDetailTimeLocation}>
                <Icon type="clock-circle"/>
                <span>{dateString}</span>
              </div>
              <div className={Styles.meetingDetailTimeLocation}>
                <i className="fa fa-telegram"/>
                <span>{locationString}</span>
              </div>
            </div>
            <Button
              style={{width: '100px', margin: '24px 0'}}
              type="primary" 
              size="large"
              onClick={() => this.setState({showRegisterModal: true})}
            >注册
            </Button>
          </Col>
        </Row>
        <Row style={{margin: '20px 0'}}>
          <span className={Styles.middleTitle}>会议介绍</span>
          <Col sm={24}>
            <span dangerouslySetInnerHTML={{__html: meeting.description}}/>
          </Col>
        </Row>
        <Row style={{margin: '20px 0'}}>
          <span className={Styles.middleTitle}>嘉宾</span>
          <Row gutter={12}>
          {meeting.guests.map((guest, index) =>
              <Col xs={24} sm={12} md={12} lg={8} key={index} style={{margin: '16px 0'}}>
                <GuestElement guest={guest}/>
              </Col>
         )}
          </Row>
        </Row>
        {
          meeting.detail &&
          <Row style={{margin: '20px 0'}}>
            <span className={Styles.middleTitle}>更多详情</span>
            <Col sm={24}>
              <span dangerouslySetInnerHTML={{__html: meeting.detail}}/>
            </Col>
          </Row>
        }
        <Tabs defaultActiveKey="1">
          <TabPane tab="留言" key={1}>
            <Reviews meetingId={this.props.params.meetingId} type="review"/>
          </TabPane>
          <TabPane tab="留言" key={2}>
            <Reviews meetingId={this.props.params.meetingId} type="review"/>
          </TabPane>
        </Tabs>
        <Modal
          visible={this.state.showRegisterModal}
          footer={false}
          onCancel={() => this.setState({showRegisterModal: false})}
        >
          <MeetingRegister
            meetingId={meeting._id}
            startDate={meeting.startDate}
            endDate={meeting.endDate}
            stayTypes={meeting.stayTypes}
          />
        </Modal>
      </div>
    );
  }
}

export = MeetingDetail;
