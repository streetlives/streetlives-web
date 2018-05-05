import React, { Component } from 'react';

import Button from '../../components/button';
import Icon from '../../components/icon';

import ServiceFormRoutes, { SERVICE_FIELDS as routes } from './routes';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';

class ServiceFormContainer extends Component {
  onBack = () => {
    const { locationId, serviceId } = this.props.match.params;
    const prevRoute = routes[this.getCurrentIndex() - 1];
    this.props.history.push(`/location/${locationId}/services/${serviceId}${prevRoute.route}`);
  };
  onNext = () => {
    const { locationId, serviceId } = this.props.match.params;
    const nextRoute = routes[this.getCurrentIndex() + 1];
    this.props.history.push(`/location/${locationId}/services/${serviceId}${nextRoute.route}`);
  };

  getCurrentIndex = () => {
    const { fieldName } = this.props.match.params;
    return routes.map(({ route }) => route.split('/').pop()).indexOf(fieldName);
  };

  render() {
    const index = this.getCurrentIndex();
    const currentRoute = routes[index];

    return (
      <div className="text-left">
        <NavBar 
          backButtonTarget={`/location/${this.props.match.params.locationId}/services/${this.props.match.params.serviceId}`}
          title={currentRoute.title} />
        <ProgressBar step={index + 1} steps={routes.length} />
        <div className="container">
          <div className="row px-4">
            <ServiceFormRoutes />
          </div>
        </div>
        <div className="position-absolute" style={{ right: 0, bottom: 12 }}>
          <div className="container">
            <div className="row px-4">
              <Button onClick={this.onBack} compact disabled={index === 0}>
                <Icon name="chevron-up" />
              </Button>
              <Button onClick={this.onNext} compact disabled={routes.length - 1 === index}>
                <Icon name="chevron-down" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ServiceFormContainer;
