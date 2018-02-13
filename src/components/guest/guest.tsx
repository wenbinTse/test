import * as React from 'react';
import { Avatar } from 'antd';
import { Guest } from '../../interface';
import * as Styles from './guest.css';

interface Props {
  guest: Guest;
}

class GuestElement extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const guest = this.props.guest;
    const name = guest.name.substr(0, 1);
    return (
      <div className={Styles.container}>
        <Avatar
          src={guest.profileImageSrc}
          size="large"
          style={{background: '#f56a00', height: '60px', width: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', fontSize: '18px', fontWeight: 'bolder'}}
        >
          {name}
        </Avatar>
        <div>
          <span>{guest.name}</span>
          <span title={guest.description}>{guest.description}</span>
        </div>
      </div>
    );
  }
}

export = GuestElement;
