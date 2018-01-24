import * as React from 'react';
import * as styles from './header.css';

class HeaderClearance extends React.Component<{}, {}> {
  public render() {
    const style: React.CSSProperties = {
      background: 'transparent',
      position: 'relative'
    };
    return (
      <div className={styles.logoContainer} style={style}>
        <div className={styles.responsiveLogoHeight}/>
      </div>
    );
  }
}

export default HeaderClearance;
