/**
 * @fileoverview This component renders a nav-bar across all children pages
 */

import * as React from 'react';
import { body } from '../global.css';
import Header = require('./header/header');
import Footer = require('./footer/footer');
import HeaderClearance from './header/header-clearance';
import UserModal = require('../user/user-modal');
import UserService from '../user/user-service';

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
        <UserModal ref={(e) => UserService.bindUserModalElement(e as UserModal)}/>
        <Header
          compactMode={this.props.children &&
          this.props.children.props.route['compact-header'] === true}
        />
        {this.props.children &&
        this.props.children.props.route['header-clearance'] === false ? '' : <HeaderClearance/>}
        <div
          className={body + ' container container-large'}
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
