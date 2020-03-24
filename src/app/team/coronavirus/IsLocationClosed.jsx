import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { selectLocationData, selectLocationError } from '../../../selectors/location';
import * as actions from '../../../actions';
import Button from '../../../components/button';
import NavBar from '../../../components/navBar';
import ErrorLabel from '../../../components/form/ErrorLabel';
import LoadingLabel from '../../../components/form/LoadingLabel';
import { OCCASIONS } from '../../../Constants';

class IsLocationClosed extends Component {
  componentDidMount() {
    if (!this.props.locationData) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  getLocationUrl = () => {
    const { pathname } = this.props.location;
    return pathname.slice(0, pathname.indexOf('/isClosed'));
  };

  getBackButtonTarget = () => `${this.getLocationUrl()}/recap`;

  selectOpen = () => this.props.history.push(this.props.nextUrl || this.getLocationUrl());

  selectClosed = () => {
    this.props.markClosed(this.props.locationData);
    this.props.history.push(`${this.getLocationUrl()}/closureInfo`);
  };

  render() {
    const {
      locationData,
      locationError,
    } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (!locationData) {
      return <LoadingLabel />;
    }

    return (
      <div className="text-left">
        <NavBar
          backButtonTarget={this.getBackButtonTarget()}
          title="Location info"
        />
        <div className="row p-4 mb-3">
          Is this location still open during the Coronavirus outbreak?
        </div>
        <div
          style={{
            left: 0,
            right: 0,
            bottom: 12,
            position: 'fixed',
          }}
        >
          <div className="p-4">
            <Button onClick={this.selectOpen} primary fluid className="mt-2">
              YES, IT’S OPEN
            </Button>
            <Button onClick={this.selectClosed} primary basic fluid className="mt-2">
              NO, IT’S CLOSED
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  markClosed: location => location.Services.forEach(service =>
    dispatch(actions.updateService({
      locationId: location.id,
      serviceId: service.id,
      params: { irregularHours: [{ occasion: OCCASIONS.COVID19, closed: true }] },
      metaDataSection: 'service',
      fieldName: 'irregularHours',
    }))),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(IsLocationClosed));
