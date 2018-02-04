/**
 * @fileoverview Set up the route for entire frontend using react router
 */

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
              <Route path="create-meeting" component={MeetingCreate} />
              <Route path="notFound" component={NotFound} />
              <Route path="*" component={NotFound} />
            </Route>
          </Router>}
      </div>
  );
  }
}

export default App;
