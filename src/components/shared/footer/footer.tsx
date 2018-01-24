import * as React from 'react';

class Footer extends React.Component<{}, {}> {
  public render() {
    const style: React.CSSProperties = {
      height: '62px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };
    return (
      <div style={style}><span>清华大学出版社</span></div>
    );
  }
}

export = Footer;
