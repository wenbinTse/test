import * as React from 'react';
import { Carousel } from 'antd';
import { Meeting } from '../../interface';
import * as Styles from './meeting.css';
interface Props {
  meetings: Meeting[];
}

class FeaturedMeetings extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    return (
      <div className={Styles.featuredMeetingsContainer}>
        <Carousel className="container container-large">
          {this.props.meetings.map((meeting, index) => 
          this.renderFeaturedMeeting(meeting))}
        </Carousel>
      </div>
    );
  }

  public renderFeaturedMeeting(meeting: Meeting) {
    const imageSrc = meeting.images && meeting.images.length ? meeting.images[0] : '';
    return (
      <div className={Styles.featuredMeetingContainer}>
        {imageSrc && <img src={imageSrc}/>}
        {!imageSrc && <div>暂无图片</div>}
        <h2>{meeting.name}</h2>
      </div>
    );
  }

}

export default FeaturedMeetings;
