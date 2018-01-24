/**
 * @fileoverview This component renders a nav-bar across all children pages
 */

import * as React from 'react';
import { body } from '../global.css';
import Header = require('./header/header');
// import HeaderClearance from './header/header-clearance';
import Footer = require('./footer/footer');

interface LayoutProps {
  children: {
    props: object
  };
}

class Layout extends React.Component<LayoutProps, {}> {
  constructor(props: LayoutProps) {
    super(props);
  }
  public render() {
    const screenHeight = document.documentElement.clientHeight;
    const minHeight = screenHeight - 62 * 2;
    return (
      <div>
        <Header
          compactMode={this.props.children &&
          this.props.children.props.route['compact-header'] === true}
        />
        <div
          className={body}
          style={{minHeight}}
        >
          {this.props.children}
        </div>
        <Footer/>
      </div>
    );
  }
}

export default Layout;
