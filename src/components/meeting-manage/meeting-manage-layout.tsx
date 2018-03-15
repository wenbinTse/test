import * as React from 'react';
import { Layout, Icon } from 'antd';
import * as Styles from './meeting-manage.css';
import { IndexLink } from 'react-router';
const Sider = Layout.Sider;
const Content = Layout.Content;

interface Props {
  params: {
    meetingId: string;
  };
}

class MeetingManageLayout extends React.Component<Props, {}> {
  public render() {
    return (
       <Layout style={{height: '100%'}}>
        <Sider
          breakpoint="md"
          collapsedWidth="0"
          style={{backgroundColor: 'black', marginBottom: '24px'}}
        >
          <div className={Styles.linkContainer}>
            <IndexLink activeClassName={Styles.active} to={`/meetingManage/${this.props.params.meetingId}`}>
              <Icon type="user"/>
              <span className="nav-text">会议信息</span>
            </IndexLink>
            <IndexLink activeClassName={Styles.active} to={`/meetingManage/${this.props.params.meetingId}/images`}>
              <Icon type="video-camera"/>
              <span className="nav-text">封面图片</span>
            </IndexLink>
            <IndexLink activeClassName={Styles.active} to={`/meetingManage/${this.props.params.meetingId}/applicants`}>
              <Icon type="user"/>
              <span className="nav-text">人员管理</span>
            </IndexLink>
            <IndexLink activeClassName={Styles.active} to={`/meetingManage/${this.props.params.meetingId}/checkIn`}>
              <Icon type="user"/>
              <span className="nav-text">签到</span>
            </IndexLink>
            <IndexLink activeClassName={Styles.active} to={`/meetingManage/${this.props.params.meetingId}/files`}>
              <Icon type="video-camera"/>
              <span className="nav-text">会议资源</span>
            </IndexLink>
          </div>
        </Sider>
        <Layout>
          <Content style={{margin: '24px 16px', minHeight: '500px'}}>
            <div className={Styles.container} style={{padding: '24px'}}>
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default MeetingManageLayout;
