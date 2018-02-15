/**
 * @fileoverview This component handles all wrong routes entered by users
 */

import * as React from 'react';
import * as styles from './not-found.css';

class NotFound extends React.Component<{}, {}> {
  public render() {
    return (
      <div className={styles.container + ' container container-large'}>
        <h1>404...Page Not Found (´Д`) </h1>
      </div>
    );
  }
}

export default NotFound;
