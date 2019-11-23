import React, { Component } from 'react';
import Button from 'components/button';
import Heart from 'components/heart';

const styles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,.75)',
  color: 'white',
  overflow: 'auto',
};

export const overlayStyles = thanks => ({
  filter: thanks && 'url(#blur)',
  overflow: thanks && 'hidden',
  width: '100%',
  height: '100%',
});

export function GaussianBlur() {
  return (
    <svg style={{ display: 'none' }}>
      <filter id="blur">
        <feGaussianBlur stdDeviation="4" />
      </filter>
    </svg>
  );
}

// eslint-disable-next-line react/prefer-stateless-function
class ThanksOverlay extends Component {
  render() {
    const {
      header, content, nextLabel, backLabel,
    } = this.props;
    return (
      <div style={styles}>
        <div className="container p-5 d-flex flex-column justify-content-between h-100">
          <div className="content">
            <p className="Header">{header}</p>
            <p>
              <Heart width="100" height="100" />
            </p>
            <p>{content}</p>
          </div>
          <div className="actions">
            {nextLabel && (
              <div className="mt-4">
                <Button className="mt-4" primary fluid onClick={this.props.onNextSection}>
                  {nextLabel}
                </Button>
              </div>
            )}
            {backLabel && (
              <div className="mt-2">
                <Button primary basic fluid onClick={this.props.onBackSection}>
                  {backLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ThanksOverlay.GaussianBlur = GaussianBlur;

export default ThanksOverlay;
