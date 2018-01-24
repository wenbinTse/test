import * as React from 'react';

const isParent = (element: HTMLElement, targetElement: HTMLElement): boolean => {
  if (element === null || targetElement === null) {
    return false;
  }

  if (document.body === targetElement) {
    return false;
  }

  if (element === targetElement) {
    return true;
  } else {
    return isParent(element, targetElement.parentElement as HTMLElement);
  }
};

interface HideOnGlobalClickProps {
  listenerMountingFlag?: boolean;
  onGlobalClick: () => void;
}

class HasGlobalClickListener extends React.Component<HideOnGlobalClickProps, {}> {
  private element: HTMLElement;
  
  public componentDidUpdate() {
    if (this.props.listenerMountingFlag !== false) {
      document.addEventListener('click', this.globalClickHandler);
      document.addEventListener('touchend', this.globalClickHandler);
    } else {
      document.removeEventListener('click', this.globalClickHandler);
      document.removeEventListener('touchend', this.globalClickHandler);
    }
  }

  public componentWillUnmount() {
    document.removeEventListener('click', this.globalClickHandler);
    document.removeEventListener('touchend', this.globalClickHandler);
  }

  public render() {
    return (
      <span ref={(span) => this.element = span as HTMLElement}>
        {this.props.children}
      </span>
    );
  }

  private globalClickHandler = (e: Event) => {
    if (!isParent(this.element, e.target as HTMLElement)) {
      this.props.onGlobalClick();
    }
  }
}

export default HasGlobalClickListener;
