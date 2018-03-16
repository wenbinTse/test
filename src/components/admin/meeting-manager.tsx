import * as React from 'react';
import Users from './users';
import { UserType } from '../../interface';

class MeetingManager extends React.Component<{}, {}> {
  
  public render() {
    return (
      <Users userType={UserType.MEETING_ADMIN}/>
    );
  }
}

export default MeetingManager;
