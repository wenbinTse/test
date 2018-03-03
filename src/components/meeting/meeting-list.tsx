import * as React from 'react';
import { List } from 'antd';
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
    return (
      <List
        loading={this.props.loading}
        dataSource={this.props.meetings}
        grid={{xs: 1, sm: 2, lg: 3, gutter: 16}}
        renderItem={(item: Meeting, index: number) =>
          <List.Item style={{width: '100%'}}>
            <MeetingCard meeting={item} index={index}/>
          </List.Item>
        }
      />
    );
  }
}

export default MeetingList;
