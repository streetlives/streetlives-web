import React, { Component } from 'react';
import moment from 'moment';

import Header from '../../../components/header';
import Button from '../../../components/button';

import ProgressBar from '../../locationInfo/ProgressBar';
import FieldItem from '../../locationInfo/FieldItem';
import NavBar from '../../NavBar';

import { SERVICE_FIELDS } from '../../serviceForm/routes';

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
  onNext = () => console.log('Next clicked!'); // eslint-disable-line no-console

  render() {
    const { locationId, serviceId } = this.props.match.params;
    return (
      <div className="text-left d-flex flex-column">
        <NavBar title="Service Details" />
        <div className="mb-5">
          <ProgressBar step={1} steps={10} />
        </div>
        <ServiceHeader>Check all the Soup Kitchen details</ServiceHeader>

        {SERVICE_FIELDS.map((field, i) => (
          <FieldItem
            key={i} // eslint-disable-line react/no-array-index-key
            title={field.title}
            linkTo={`/location/${locationId}/services/${serviceId}${field.route}`}
            updatedAt={moment().subtract(2, 'months')}
          />
        ))}
        <Button fluid primary onClick={this.onNext}>
          Service info completed
        </Button>
      </div>
    );
  }
}

export default ServiceDetails;
