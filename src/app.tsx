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
import LoginModal = require('./components/user/user-modal');
// import UserService from "./components/user/user-service";

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
    // UserService.requestUserProfile(() => {
      this.setState({loading: false});
    // });
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
              <Route path="loginModal" component={LoginModal} />
            </Route>
          </Router>}
      </div>
  );
  }
}

export default App;
