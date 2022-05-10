import React, { Component } from 'react';

import ServiceFormRoutes, { SERVICE_FIELDS as routes } from './routes';
import ServiceForm from '../serviceForm/ServiceForm';

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
      const route = routes[idx];
      this.props.history.push(`${this.getServiceUrl()}${route.urlFragment}/thanks`);
    } else {
      const nextRoute = routes[this.getCurrentIndex() + 1];
      this.props.history.push(`${this.getServiceUrl()}${nextRoute.urlFragment}`);
    }
  };

  onNextSection = () => {
    const { locationId } = this.props.match.params;
    this.props.history.push(`/team/coronavirus/location/${locationId}/services/recap`);
  };

  getServiceUrl = () => {
    const { locationId, serviceId } = this.props.match.params;
    return `/team/coronavirus/location/${locationId}/services/${serviceId}`;
  };

  getBackUrl = () => {
    const { locationId } = this.props.match.params;
    return `/team/coronavirus/location/${locationId}/services/recap`;
  };

  getCurrentIndex = () => {
    const { fieldName } = this.props.match.params;
    if (!fieldName) return 0;
    return routes.map(({ urlFragment }) => urlFragment.split('/').pop()).indexOf(fieldName);
  };

  render() {
    const index = this.getCurrentIndex();
    const currentRoute = routes[index];

    const showThanks = this.props.location.pathname.split('/').pop() === 'thanks';

    return (
      <ServiceForm
        onNext={this.onNext}
        onBack={this.onBack}
        backButtonTarget={this.getBackUrl()}
        currentIndex={index}
        currentRoute={currentRoute}
        totalRoutes={routes.length}
        showThanks={showThanks}
        onNextSection={this.onNextSection}
      >
        <ServiceFormRoutes onNext={this.onNext} />
      </ServiceForm>
    );
  }
}

export default ServiceFormContainer;
