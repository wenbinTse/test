import * as React from 'react';
import { browserHistory } from 'react-router';
import { Spin } from 'antd';
import * as Styles from './user.css';
import HttpRequestDelegate from '../../http-request-delegate';
import { ResponseCode } from '../../interface';
import Urls from '../../urls';

interface Props {
  params: {
    hash: string;
    userId: string;
  };
}

interface State {
  loading: boolean;
}

class Verify extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.verify(this.props.params.userId, this.props.params.hash),
      false,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({loading: false});
        } else {
          browserHistory.push('/NotFound');
        }
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return (
        <div className={Styles.loading} style={{minHeight: '400px'}}>
          <Spin size={'large'}/>
        </div>
      );
    }
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}><h1>您的邮箱验证成功</h1></div>
    );
  }
}

export = Verify;
