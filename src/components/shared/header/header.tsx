import * as React from 'react';
import { IndexLink } from 'react-router';
import { User } from '../../../interface';
import * as styles from './header.css';
import HasGlobalClickListener from '../has-global-click-listener';
import { CSSTransitionGroup } from 'react-transition-group';

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
  private usernameEle: HTMLElement | null;
  /** @constructor */
  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      collapseLogo: this.props.compactMode === true,
      showUserPanel: false,
      userProfile: null
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
    const userButton = this.state.userProfile === null ?
      (
        <div className={styles.userLoginContainer}>
          <a
            // onClick={() => UserService.requireLogin()}
            onClick={() => alert(1)}
          >
            LOG IN
          </a>
        </div>
      ) :
      (
        <div
          className={styles.userLoginContainer}
          ref={(ele: HTMLElement | null) => this.usernameEle = ele}
        >
          <HasGlobalClickListener
            listenerMountingFlag={this.state.showUserPanel}
            onGlobalClick={() => { this.setState({showUserPanel: false}); }}
          >
            <div
              className={styles.username}
              onClick={(e) => {
                this.setState({showUserPanel: !this.state.showUserPanel});
                e.stopPropagation();
              }}
            >
              Hi, nihao
            </div>
            <CSSTransitionGroup
              transitionName={{
                enter: styles.userPanelContainerEnter,
                enterActive: styles.userPanelContainerEnterActive,
                leave: styles.userPanelContainerLeave,
                leaveActive: styles.userPanelContainerLeaveActive,
              }}
              transitionEnterTimeout={200}
              transitionLeaveTimeout={200}
            >
              {this.state.showUserPanel ? (
                <div
                  className={styles.userPanelDropdown}
                  onClick={() => { this.setState({showUserPanel: false}); }}
                >
                  <div
                    className={styles.arrow}
                    style={{
                      right: (this.usernameEle ? this.usernameEle.clientWidth / 2 : 20) + 'px'
                    }}
                  />
                  <ul>
                    <li>
                      APPOINTMENTS
                    </li>
                    <li>
                      LIKED LOOKS
                    </li>
                    <li className={styles.breakLine}/>
                    <li>
                      LOGOUT
                    </li>
                  </ul>
                </div>
              ) : null}
            </CSSTransitionGroup>
          </HasGlobalClickListener>
        </div>
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
            <div>{userButton}</div>
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
}


export = Header;
