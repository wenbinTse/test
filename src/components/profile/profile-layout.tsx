import * as React from 'react';
import { Link } from 'react-router';
import { Layout, Icon, Menu } from 'antd';
import * as Styles from './profile.css';
const Sider = Layout.Sider;
const Content = Layout.Content;

class ProfileLayout extends React.Component<{}, {}> {
  public render() {
    return (
      <Layout style={{height: '100%'}}>
        <Sider
          breakpoint="md"
          collapsedWidth="0"
          style={{backgroundColor: 'black'}}
        >
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
            <Menu.Item key="1">
              <Link activeClassname={Styles.active} to="/profile">
                <Icon type="user"/>
                <span className="nav-text">nav 1</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="video-camera"/>
              <span className="nav-text">nav 2</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{margin: '24px 16px 0'}}>
            <div style={{padding: 24, background: '#fff', minHeight: 360}}>
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default ProfileLayout;
