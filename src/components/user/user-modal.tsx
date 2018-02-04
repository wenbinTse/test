import * as React from 'react';
import { Modal } from 'antd';
import Login = require('./login');
import Register = require('./register');
import { UserMode } from '../../interface';

interface State {
  visible: boolean;
  mode: UserMode;
  refresh?: boolean;
}

class UserModal extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      visible: false,
      mode: UserMode.LOGIN
    };
  }
  public render() {
    return (
      <Modal
        footer={false}
        visible={this.state.visible}
        onCancel={() => this.setState({visible: false})}
      >
        {this.state.mode === UserMode.LOGIN ? <Login/> : <Register/>}
      </Modal>
    );
  }
}

export = UserModal;
