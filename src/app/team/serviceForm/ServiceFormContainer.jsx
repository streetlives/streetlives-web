import React, { Component } from 'react';

import ServiceFormRoutes, { SERVICE_FIELDS as routes } from './routes';
import ServiceForm from './ServiceForm';

class ServiceFormContainer extends Component {
  constructor(props) {
    super(props);
    this.onNext = this.onNext.bind(this);
    this.onBack = this.onBack.bind(this);
  }

  onBack = () => {
    const prevRoute = routes[this.getCurrentIndex() - 1];
    this.props.history.push(`${this.getServiceUrl()}${prevRoute.urlFragment}`);
  };

  onNext = () => {
    const idx = this.getCurrentIndex();
    if (idx === routes.length - 1) {
      this.props.history.push(`${this.getServiceUrl()}/documents`);
    } else {
      const nextRoute = routes[this.getCurrentIndex() + 1];
      this.props.history.push(`${this.getServiceUrl()}${nextRoute.urlFragment}`);
    }
  };

  getServiceUrl = () => {
    const { locationId, serviceId } = this.props.match.params;
    return `/team/location/${locationId}/services/${serviceId}`;
  };

  getCurrentIndex = () => {
    const { fieldName } = this.props.match.params;
    return routes.map(({ urlFragment }) => urlFragment.split('/').pop()).indexOf(fieldName);
  };

  render() {
    const index = this.getCurrentIndex();
    const currentRoute = routes[index];

    return (
      <ServiceForm
        onNext={this.onNext}
        onBack={this.onBack}
        backButtonTarget={this.getServiceUrl()}
        currentIndex={index}
        currentRoute={currentRoute}
        totalRoutes={routes.length}
      >
        <ServiceFormRoutes onNext={this.onNext} />
      </ServiceForm>
    );
  }
}

export default ServiceFormContainer;
