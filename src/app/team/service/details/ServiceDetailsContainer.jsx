import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  selectLocationError,
  selectLocationData,
} from '../../../../selectors/location';
import { getService, getServiceTaxonomy } from '../../../../selectors/service';
import * as actions from '../../../../actions';

import ServiceDetails from './ServiceDetails';
import Button from '../../../../components/button';

import { SERVICE_FIELDS } from '../../serviceForm/routes';

class ServiceDetailsContainer extends Component {
  componentDidMount() {
    if (Object.keys(this.props.service).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  onGoToDocs = () => {
    this.props.history.push(`${this.getServiceUrl()}/documents`);
  };

  getServiceUrl = () => {
    const { locationId, serviceId } = this.props.match.params;
    return `/team/location/${locationId}/services/${serviceId}`;
  };

  filteredServiceFields = () => (
    SERVICE_FIELDS.filter((el) => {
      if (el.serviceTaxonomy) {
        return el.serviceTaxonomy === this.props.serviceTaxonomy;
      }

      return true;
    })
  );

  render() {
    return (
      <ServiceDetails
        backButtonTarget={`/team/location/${this.props.match.params.locationId}/services`}
        getServiceUrl={this.getServiceUrl}
        service={this.props.service}
        locationData={this.props.locationData}
        locationError={this.props.locationError}
        serviceFields={this.filteredServiceFields()}
      >
        <Button fluid primary onClick={this.onGoToDocs}>
          Go to docs required
        </Button>
      </ServiceDetails>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  service: getService(state, ownProps),
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
  serviceTaxonomy: getServiceTaxonomy(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetailsContainer);
