import * as React from 'react';
import { IndexLink } from 'react-router';
import { Layout, Icon } from 'antd';
import * as Styles from './profile.css';
import { body } from '../global.css';
const Sider = Layout.Sider;
const Content = Layout.Content;

class ProfileLayout extends React.Component<{}, {}> {
  public render() {
    return (
      <Layout style={{height: '100%'}}>
        <Sider
          breakpoint="md"
          collapsedWidth="0"
          style={{backgroundColor: 'black', marginBottom: '24px'}}
        >
          <div className={Styles.linkContainer}>
            <IndexLink activeClassName={Styles.active} to="/profile">
              <Icon type="user"/>
              <span className="nav-text">个人信息</span>
            </IndexLink>
            <IndexLink activeClassName={Styles.active} to="/profile/meetings">
              <Icon type="video-camera"/>
              <span className="nav-text">会议列表</span>
            </IndexLink>
            <IndexLink activeClassName={Styles.active} to="/profile/qrcode">
              <Icon type="qrcode"/>
              <span className="nav-text">签到二维码</span>
            </IndexLink>
          </div>
        </Sider>
        <Layout>
          <Content className={body}>
            <div style={{margin: '24px', padding: '24px'}}>
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default ProfileLayout;
