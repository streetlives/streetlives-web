import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  selectLocationError,
  selectLocationData,
} from '../../../selectors/location';
import { getService } from '../../../selectors/service';
import * as actions from '../../../actions';

import ServiceDetails from '../service/details/ServiceDetails';

import { SERVICE_FIELDS } from './routes';

class ServiceDetailsContainer extends Component {
  componentDidMount() {
    if (Object.keys(this.props.service).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  getServiceUrl = () => {
    const { locationId, serviceId } = this.props.match.params;
    return `/team/coronavirus/location/${locationId}/services/${serviceId}`;
  };

  getBackButtonTarget = () =>
    `/team/coronavirus/location/${this.props.match.params.locationId}/services/recap`;

  render() {
    return (
      <ServiceDetails
        backButtonTarget={this.getBackButtonTarget()}
        getServiceUrl={this.getServiceUrl}
        service={this.props.service}
        locationData={this.props.locationData}
        locationError={this.props.locationError}
        serviceFields={SERVICE_FIELDS}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  service: getService(state, ownProps),
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetailsContainer);
