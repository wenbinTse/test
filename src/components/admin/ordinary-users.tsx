import * as React from 'react';
import { UserType } from '../../interface';
import Users from './users';

class OrdinaryUsers extends React.Component<{}, {}> {
  public render() {
    return (
      <Users userType={UserType.ORDINARY}/>
    );
  }
}

export default OrdinaryUsers;
