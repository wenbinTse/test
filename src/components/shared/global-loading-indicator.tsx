import * as React from 'react';

const BASE_INTERVAL = 100;
const RANDOM_POST_INTERVAL = 500;
const FINISH_DELAY = 500;
const PROGRESS_INCREMENT = 0.05;

interface GlobalLoadingIndicatorState {
  progress: number;
  show: boolean;
}

class GlobalLoadingIndicator extends React.Component<{}, GlobalLoadingIndicatorState> {
  private timeoutId: number;

  constructor(props: {}) {
    super(props);
    this.state = {
      progress: 0,
      show: false
    };
  }

  public start = () => {
    this.setState({
      progress: 10,
      show: true
    });
    const timeout = () => {
      this.timeoutId = window.setTimeout(
        () => {
          this.setState({
            progress: this.state.progress + (100 - this.state.progress) * PROGRESS_INCREMENT
          });
          if (this.state.show) {
            timeout();
          }
        },
        BASE_INTERVAL + RANDOM_POST_INTERVAL * Math.random());
    };
    timeout();
  }

  public stop = () => {
    clearTimeout(this.timeoutId);
    this.setState({
      progress: 100
    });
    window.setTimeout(
      () => {
      this.setState({
        progress: 0,
        show: false
      });
    },
      FINISH_DELAY);
  }

  public render() {
    const style: React.CSSProperties = {
      backgroundColor: '#000',
      boxShadow: '0 0 5px #ccc',
      display: this.state.show ? 'block' : 'none',
      height: '2px',
      left: '0',
      position: 'fixed',
      top: '0',
      transition: 'width ' + (BASE_INTERVAL / 1000) + 's linear',
      width: this.state.progress + '%',
      zIndex: 1000
    };
    return (
      <div style={style}/>
    );
  }
}

export default GlobalLoadingIndicator;
