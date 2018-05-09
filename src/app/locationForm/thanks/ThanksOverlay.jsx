import React, { Component } from 'react';
import Button from '../../../components/button';
import Heart from './heart';

// eslint-disable-next-line react/prefer-stateless-function
class ThanksOverlay extends Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,.75)',
          color: 'white',
          padding: '3em',
          overflow: 'auto',
        }}
      >
        <p className="Header">Thanks so much!</p>
        <p>
          <Heart width="100" height="100" />
        </p>
        <p>
          The community can now trust this information, because you&apos;ve checked that it&apos;s
          good!
        </p>
        <div style={{ margin: '3em' }} />
        <Button primary fluid onClick={this.props.onNextSection}>
          GO TO NEXT SECTION
        </Button>
        <div style={{ margin: '.5em' }} />
        <Button primary basic fluid onClick={this.props.onBackSection}>
          BACK TO LOCATION INFO
        </Button>
      </div>
    );
  }
}

export default ThanksOverlay;
