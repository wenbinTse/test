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
      <a className={Styles.featuredMeetingContainer} href={'/meeting/' + meeting._id}>
        {imageSrc && <img src={imageSrc} className={Styles.featuredMeetingImg}/>}
        {!imageSrc && <div>暂无图片</div>}
        <h1>{meeting.name}</h1>
      </a>
    );
  }

}

export default FeaturedMeetings;
