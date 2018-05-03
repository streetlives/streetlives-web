import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Button from '../../../components/button';
import Heart from './heart';

class ThanksOverlay extends Component {
  render() {
    return (
      <div style={{ position : 'absolute', top:'0', left:'0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,.75)', color: 'white', padding: '3em', overflow:'auto'}}>
        <p className="Header">Thanks so much!</p>
        <p><Heart width="100" height="100"/></p>
        <p>
          The community can now trust this information, because you've checked that it's good!
        </p>
        <div style={{ margin: '3em' }} />
        <Button primary fluid onClick={ () => this.props.history.push(`/location/${this.props.match.params.locationId}/services`) }> 
          GO TO NEXT SECTION
        </Button>
        <div style={{ margin: '.5em' }} />
        <Button primary basic fluid color="white" onClick={ () => this.props.history.push(`/location/${this.props.match.params.locationId}`)}>
          BACK TO LOCATION INFO
        </Button>
      </div>
    );
  }
}

export default withRouter(ThanksOverlay);
