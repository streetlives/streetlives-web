import React, { Component } from 'react';
import moment from 'moment';

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

class ServiceDetails extends Component {
  onGoToDocs = () => {
    const { locationId, serviceId } = this.props.match.params;
    this.props.history.push(`${getServiceUrl(locationId, serviceId)}/documents`);
  };

  render() {
    const { locationId, serviceId } = this.props.match.params;
    return (
      <div className="text-left d-flex flex-column">
        <NavBar 
          backButtonTarget={`/location/${this.props.match.params.locationId}/services`}
          title="Service Details" />
        <div className="mb-5">
          <ProgressBar step={1} steps={10} />
        </div>
        <ServiceHeader>Check all the Soup Kitchen details</ServiceHeader>

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

export default ServiceDetails;
