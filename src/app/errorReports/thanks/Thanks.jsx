import React, { Component } from 'react';
import Button from '../../../components/button';
import Heart from '../../../components/heart';
import withErrorReportsForm from '../withErrorReportsForm';

class Thanks extends Component {
  constructor(props) {
    super(props);
    this.goToViewLocation = this.goToViewLocation.bind(this);
  }

  goToViewLocation() {
    this.props.history.push(`/find/location/${this.props.match.params.locationId}/view`);
  }

  render() {
    return (
      <div className="container pb-5 pt-2 px-4 d-flex flex-column justify-content-between h-100">
        <div className="content text-left">
          <p>
            <Heart width="100" height="100" />
          </p>
          <p className="Header">Thank you so much!</p>
          <p>
            You&#39;re helping everyone to get more reliable information.
            And the reliable information is making it easier for people to get the help they need.
          </p>
          <p>
            Thank you.
          </p>
        </div>
        <div className="actions">
          <div className="mt-4">
            <Button className="mt-4" primary fluid onClick={this.goToViewLocation}>
              DONE
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default withErrorReportsForm(Thanks);
