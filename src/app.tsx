/**
 * @fileoverview Set up the route for entire frontend using react router
 */
// tslint:disable-next-line:no-var-requires
require('es6-shim');

import * as React from 'react';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';
import Home = require('./components/home');
import Layout from './components/shared/layout';
import Login = require('./components/user/login');
import Register = require('./components/user/register');
import GlobalLoadingIndicator from './components/shared/global-loading-indicator';
import HttpRequestDelegate from './http-request-delegate';
import Verify = require('./components/user/verify');
import NotFound from './components/not-found/not-found';
import UserService from './components/user/user-service';
import ForgetPassword = require('./components/user/forget-password');
import MeetingCreate = require('./components/meeting/meeting-create');
import MeetingDetail = require('./components/meeting/meeting');
import ProfileLayout from './components/profile/profile-layout';
import PersonalInfo from './components/profile/personal-info';
import MeetingManage from './components/meeting-manage/meeting-manage';
import MeetingManageLayout from './components/meeting-manage/meeting-manage-layout';
import MeetingManageImage from './components/meeting-manage/meeting-manage-image';
import MeetingManageFile from './components/meeting-manage/meeting-manage-file';
import ProfileMeetings from './components/profile/profile-meetings';
import MeetingApplicants from './components/meeting-manage/meeting-manage-applicants';
import QrCode from './components/profile/qrcode';
import Checkin from './components/meeting-manage/checkin';
import AdminLayout from './components/admin/admin-layout';
import MeetingManager from './components/admin/meeting-manager';
import OrdinaryUsers from './components/admin/ordinary-users';
import MeetingsForAdmin from './components/admin/meetings';
import CloseMeeting from './components/meeting-manage/close-meeting';
import SendEmail from './components/meeting-manage/meeting-manage-email';

interface State {
  loading: boolean;
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      loading: true
    };
  }

  public componentDidMount() {
    UserService.requestUserProfile(() => {
      this.setState({loading: false});
    });
  }

  public render() {
    return (
      <div>
        <GlobalLoadingIndicator
          ref={(indicator: GlobalLoadingIndicator) =>
            HttpRequestDelegate.bindLoadingIndicator(indicator)}
        />
        {this.state.loading ? null :
          <Router
            history={browserHistory}
          >
            <Route path="/" component={Layout}>
              <IndexRoute component={Home}/>
              <Route path="login" component={Login} />
              <Route path="register" component={Register} />
              <Route path="verify/:userId/:hash" component={Verify} />
              <Route path="forgetPassword" component={ForgetPassword} />
              <Route path="meeting/:meetingId" component={MeetingDetail} />
              <Route path="createMeeting" component={MeetingCreate} />
              <Route path="profile" component={ProfileLayout}>
                <IndexRoute component={PersonalInfo}/>
                <Route path="meetings" component={ProfileMeetings} />
                <Route path="qrcode" component={QrCode} />
              </Route>
              <Route path="/meetingManage/:meetingId" component={MeetingManageLayout}>
                <IndexRoute component={MeetingManage} />
                <Route path="images" component={MeetingManageImage} />
                <Route path="files" component={MeetingManageFile} />
                <Route path="applicants" component={MeetingApplicants} />
                <Route path="checkin" component={Checkin} />
                <Route path="close" component={CloseMeeting}/>
                <Route path="email" component={SendEmail} />
              </Route>
              <Route path="/admin" component={AdminLayout}>
                <IndexRoute component={MeetingManager}/>
                <Route path="ordinaryUsers" component={OrdinaryUsers}/>
                <Route path="meetings" component={MeetingsForAdmin}/>
              </Route>
              <Route path="notFound" component={NotFound} />
              <Route path="*" component={NotFound} />
            </Route>
          </Router>}
      </div>
  );
  }
}

export default App;
