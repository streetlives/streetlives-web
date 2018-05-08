import React, { Component } from 'react';

import Button from '../../components/button';
import Icon from '../../components/icon';

import DocumentFormRoutes, { DOCUMENT_FIELDS as routes } from './routes';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import ThanksOverlay from '../locationForm/thanks/ThanksOverlay';
import NotFound from '../notFound/NotFound';

const getDocsUrl = (locationId, serviceId) =>
  `/location/${locationId}/services/${serviceId}/documents`;

class DocsFormContainer extends Component {
  onBack = () => {
    const { locationId, serviceId } = this.props.match.params;
    const prevRoute = routes[this.getCurrentIndex() - 1];
    this.props.history.push(`${getDocsUrl(locationId, serviceId)}${prevRoute.urlFragment}`);
  };

  onNext = () => {
    const { locationId, serviceId } = this.props.match.params;
    const idx = this.getCurrentIndex();
    if (idx === routes.length - 1) {
      this.props.history.push(`${this.props.location.pathname}/thanks`);
    } else {
      const nextRoute = routes[this.getCurrentIndex() + 1];
      this.props.history.push(`${getDocsUrl(locationId, serviceId)}${nextRoute.urlFragment}`);
    }
  };

  onNextSection = () => {
    this.props.history.push('/');
  };
  onBackSection = () => {
    const { locationId } = this.props.match.params;
    this.props.history.push(`/location/${locationId}/services/recap`);
  };

  getCurrentIndex = () => {
    const { fieldName } = this.props.match.params;
    return routes.map(({ urlFragment }) => urlFragment.split('/').pop()).indexOf(fieldName);
  };

  render() {
    const { locationId, serviceId } = this.props.match.params;
    const index = this.getCurrentIndex();
    const currentRoute = routes[index];

    const showThanks = this.props.location.pathname.split('/').pop() === 'thanks';

    if (!currentRoute) {
      return <NotFound />;
    }

    return (
      <div className="text-left">
        <NavBar backButtonTarget={getDocsUrl(locationId, serviceId)} title={currentRoute.label} />
        <ProgressBar step={index + 1} steps={routes.length} />
        <div className="container">
          <div className="row px-4">
            <DocumentFormRoutes onNext={this.onNext} />
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
        {showThanks && (
          <ThanksOverlay onBackSection={this.onBackSection} onNextSection={this.onNextSection} />
        )}
      </div>
    );
  }
}

export default DocsFormContainer;
