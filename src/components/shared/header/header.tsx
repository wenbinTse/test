import * as React from 'react';
import { IndexLink } from 'react-router';
import { Dropdown, Icon } from 'antd';
import { User } from '../../../interface';
import * as styles from './header.css';
import UserService from '../../user/user-service';
// import { ClickParam } from 'antd/lib/menu';

interface HeaderProps {
  compactMode?: boolean;
}

interface HeaderState {
  userProfile: User | null;
  collapseLogo: boolean;
  showUserPanel: boolean;
}

const LOGO_COLLAPSE_DISTANCE = 100;
const LOGO_COLLAPSE_DELAY = 200;

class Header extends React.Component<HeaderProps, HeaderState> {
  /** @constructor */
  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      collapseLogo: this.props.compactMode === true,
      showUserPanel: false,
      userProfile: UserService.getUserProfile()
    };
  }

  public componentDidMount() {
    if (!this.props.compactMode) {
      window.addEventListener('scroll', this.windowScrollHandler);
    }
  }

  public componentDidUpdate() {
    if (!this.props.compactMode) {
      this.windowScrollHandler();
      window.addEventListener('scroll', this.windowScrollHandler);
    } else {
      if (!this.state.collapseLogo) {
        this.setState({collapseLogo: true});
      }
      window.removeEventListener('scroll', this.windowScrollHandler);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('scroll', this.windowScrollHandler);
  }

  public render() {
    const menu = (
      <div className={styles.menu}>
        <div className={styles.arrow}/>
        <li>
          个人信息
        </li>
        <li>
          已参加会议
        </li>
        <hr/>
        <li onClick={() => UserService.logout()}>
          退出
        </li>
      </div>
    );
    const userButton = this.state.userProfile === null ?
      (
        <div className={styles.userLoginContainer}>
          <a
            onClick={() => UserService.requireLogin()}
          >
            <Icon
              type="user"
            />
            登录
          </a>
        </div>
      ) : (
        <Dropdown overlay={menu} placement="bottomRight">
          <a className="ant-dropdown-link" href="#">
            Hi, {this.state.userProfile.name}
          </a>
        </Dropdown>
      );

    let navStyle = {};
    let logoStyle = {};
    let logoImageStyle = {};
    if (this.state.collapseLogo) {
      navStyle = {
        paddingLeft: '172px'
      };
      logoStyle = {
        padding: '15px',
        top: '0'
      };
      logoImageStyle = {
        height: '32px'
      };
    }

    return (
      <div
        className={styles.nav + (this.props.compactMode ? ' ' + styles.navCompact : '')}
      >
        <div className="container container-large container-mobile-no-padding">
          <nav className={styles.navContainer} style={navStyle}>
            <div className={styles.menuContainer}>{userButton}</div>
          </nav>
          <div className={styles.logoContainer} style={logoStyle}>
            <IndexLink to="/">
              <img
                className={styles.responsiveLogoHeight}
                style={logoImageStyle}
                src="/static/image/logo.png"
              />
            </IndexLink>
          </div>
        </div>
      </div>
    );
  }

  private windowScrollHandler = () => {
    if (window.scrollY > LOGO_COLLAPSE_DISTANCE && !this.state.collapseLogo) {
      window.setTimeout(
        () => {
          if (window.scrollY > LOGO_COLLAPSE_DISTANCE) {
            this.setState({collapseLogo: true});
          }
        },
        LOGO_COLLAPSE_DELAY
      );
    } else if (window.scrollY <= LOGO_COLLAPSE_DISTANCE && this.state.collapseLogo) {
      window.setTimeout(
        () => {
          if (window.scrollY <= LOGO_COLLAPSE_DISTANCE) {
            this.setState({collapseLogo: false});
          }
        },
        LOGO_COLLAPSE_DELAY
      );
    }
  }

  // private menuClickHandler = (e: ClickParam) => {
  //   console.log(e.key)
  // }
}

export = Header;
