import * as React from 'react';
import { List, Spin, Row, Col } from 'antd';
import { Meeting } from '../../interface';
import MeetingCard from './meeting-card';

interface Props {
  meetings: Meeting[];
  loading: boolean;
}

class MeetingList extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.setState({meetings: nextProps.meetings});
  }

  public render() {
    if (this.props.loading) {
      return (
        <div style={{width: '100%', display: 'flex', height: '200px', justifyContent: 'center', alignItems: 'center'}}>
          <Spin/>
        </div>
      );
    }
    return (
      <Row gutter={16}>
        {this.props.meetings.map((meeting, index) =>
        <Col key={meeting._id} xs={24} sm={12} lg={8}>
          <MeetingCard meeting={meeting} index={index}/>
        </Col>
        )}
      </Row>

    );
  }
}

export default MeetingList;
