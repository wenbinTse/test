/**
 * @fileoverview Set up the route for entire frontend using react router
 */

import * as React from 'react';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';
import Home = require('./components/home');
import Layout from './components/shared/layout';

class App extends React.Component<{}, {}> {
  public render() {
    return (
    <Router
      history={browserHistory}
    >
      <Route path="/" component={Layout}>
        <IndexRoute component={Home}/>
      </Route>
    </Router>
  );
  }
}

export default App;
