import * as React from 'react';

class Footer extends React.Component<{}, {}> {
  public render() {
    const style: React.CSSProperties = {
      height: '62px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      background: 'black',
      fontWeight: 400,
      fontSize: '18px'
    };
    return (
      <div style={style}><span>TUP Design ©2017 Created by 清华大学出版社</span></div>
    );
  }
}

export = Footer;
