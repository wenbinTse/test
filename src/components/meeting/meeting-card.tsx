import * as React from 'react';
import { Carousel, Icon } from 'antd';
import { Meeting } from '../../interface';
import * as moment from 'moment';
import * as Styles from './meeting.css';

const dateFormat = 'YYYY/M/D';

interface Props {
  meeting: Meeting;
  index?: number;
}

class MeetingCard extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const meeting = this.props.meeting;

    const startMoment = moment(meeting.startDate);
    const endMoment = moment(meeting.endDate);
    const dateString = startMoment.isSame(endMoment, 'day') ?
      startMoment.format(dateFormat) : startMoment.format(dateFormat) + ' - ' + endMoment.format(dateFormat);
    const locationString = meeting.location.province + meeting.location.city + meeting.location.address;

    return (
      <a href={'/meeting/' + this.props.meeting._id}>
        <div className={Styles.cardContainer}>
          {!meeting.images.length &&
          <div className={Styles.none}>暂无图片</div>}
          <Carousel className={Styles.carousel}>
            {meeting.images.map((src, index) =>
              <img alt="图片" key={index} src={src}/>
            )}
          </Carousel>
          <div>
            <h3>{meeting.name}</h3>
            <div className={Styles.item}>
              <Icon type="clock-circle"/>
              <span>{dateString}</span>
            </div>
            <div className={Styles.item}>
              <span>{locationString}</span>
            </div>
          </div>
        </div>
      </a>
    );
  }
}

export default MeetingCard;
