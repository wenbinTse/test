import * as React from 'react';
import { IndexLink } from 'react-router';
import { Layout, Icon } from 'antd';
import * as Styles from './admin.css';
const Sider = Layout.Sider;
const Content = Layout.Content;

class AdminLayout extends React.Component<{}, {}> {
  public render() {
    return (
      <Layout style={{height: '100%'}}>
        <Sider
          breakpoint="md"
          collapsedWidth="0"
          style={{backgroundColor: 'black', marginBottom: '24px', height: '500px'}}
        >
          <div className={Styles.linkContainer}>
            <IndexLink activeClassName={Styles.active} to="/admin">
              <Icon type="user"/>
              <span className="nav-text">会议管理员</span>
            </IndexLink>
            <IndexLink activeClassName={Styles.active} to="/admin/ordinary">
              <Icon type="usergroup-add" />
              <span className="nav-text">普通用户</span>
            </IndexLink>
          </div>
        </Sider>
        <Layout>
          <Content style={{margin: '24px 16px 0'}}>
            <div>
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default AdminLayout;
