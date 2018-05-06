import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import { getService } from '../../../selectors/service';
import * as actions from '../../../actions';
import Header from '../../../components/header';
import Button from '../../../components/button';

import ProgressBar from '../../locationInfo/ProgressBar';
import FieldItem from '../../locationInfo/FieldItem';
import NavBar from '../../NavBar';

import { SERVICE_FIELDS } from '../../serviceForm/routes';

// TODO: update fields to have updated value
const FAKE_UPDATED_AT = moment().subtract(2, 'months');

const getServiceUrl = (locationId, serviceId) => `/location/${locationId}/services/${serviceId}`;

function ServiceHeader({ children }) {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">{children}</Header>
      </div>
    </div>
  );
}

const LoadingView = () => (
  <div className="d-flex flex-column">
    <NavBar title="Services Details" />
    <p>
      <i className="fa fa-spinner fa-spin" aria-hidden="true" /> Loading location data ...{' '}
    </p>
  </div>
);

class ServiceDetails extends Component {
  componentWillMount() {
    if (Object.keys(this.props.service).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  onGoToDocs = () => {
    const { locationId, serviceId } = this.props.match.params;
    this.props.history.push(`${getServiceUrl(locationId, serviceId)}/documents`);
  };

  render() {
    const { service } = this.props;
    const { locationId, serviceId } = this.props.match.params;

    if (Object.keys(service).length === 0) {
      return <LoadingView />;
    }

    return (
      <div className="text-left d-flex flex-column">
        <NavBar
          backButtonTarget={`/location/${this.props.match.params.locationId}/services`}
          title="Service Details"
        />
        <div className="mb-5">
          <ProgressBar step={1} steps={10} />
        </div>
        <ServiceHeader>Check all the {service.name} details</ServiceHeader>

        {SERVICE_FIELDS.map(field => (
          <FieldItem
            key={field.title}
            title={field.title}
            linkTo={`${getServiceUrl(locationId, serviceId)}${field.route}`}
            updatedAt={FAKE_UPDATED_AT}
          />
        ))}
        <Button fluid primary onClick={this.onGoToDocs}>
          Go to docs required
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  service: getService(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetails);
