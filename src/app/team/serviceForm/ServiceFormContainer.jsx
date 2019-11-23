import React, { Component } from 'react';

import Button from 'components/button';
import Icon from 'components/icon';
import ProgressBar from 'components/progressBar';
import NavBar from 'components/navBar';

import ServiceFormRoutes, { SERVICE_FIELDS as routes } from './routes';
import NotFound from '../../notFound/NotFound';

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

    if (!currentRoute) {
      return <NotFound />;
    }

    return (
      <div className="text-left">
        <NavBar
          backButtonTarget={this.getServiceUrl()}
          title={currentRoute.label}
        />
        <ProgressBar step={index + 1} steps={routes.length} />
        <div
          style={{ marginBottom: '5em' }}
          className="container"
        >
          <div className="row px-4">
            <ServiceFormRoutes onNext={this.onNext} />
          </div>
        </div>
        <div style={{ right: 0, bottom: 12, position: 'fixed' }}>
          <div
            className="container"
          >
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
