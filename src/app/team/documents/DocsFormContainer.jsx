import React, { Component } from 'react';

import Button from '../../../components/button';
import Icon from '../../../components/icon';
import ProgressBar from '../../../components/progressBar';
import NavBar from '../../../components/navBar';

import DocumentFormRoutes, { DOCUMENT_FIELDS as routes } from './routes';
import ThanksOverlay, { overlayStyles } from '../locationForm/thanks/ThanksOverlay';
import NotFound from '../../notFound/NotFound';

const thanksHeader = 'Fantastic!';
const thanksContent =
  "You're making it easier for people to get the help they need because of the work you're doing.";

class DocsFormContainer extends Component {
  onBack = () => {
    const prevRoute = routes[this.getCurrentIndex() - 1];
    this.props.history.push(`${this.getDocsUrl()}${prevRoute.urlFragment}`);
  };

  onNext = () => {
    const idx = this.getCurrentIndex();
    if (idx === routes.length - 1) {
      const route = routes[idx];
      this.props.history.push(`${this.getDocsUrl()}${route.urlFragment}/thanks`);
    } else {
      const nextRoute = routes[idx + 1];
      this.props.history.push(`${this.getDocsUrl()}${nextRoute.urlFragment}`);
    }
  };

  onNextSection = () => {
    const { locationId } = this.props.match.params;
    this.props.history.push(`/team/location/${locationId}/services/recap`);
  };

  getDocsUrl = () => {
    const { locationId, serviceId } = this.props.match.params;
    return `/team/location/${locationId}/services/${serviceId}/documents`;
  };

  getCurrentIndex = () => {
    const { fieldName } = this.props.match.params;
    return routes.map(({ urlFragment }) => urlFragment.split('/').pop()).indexOf(fieldName);
  };

  render() {
    const index = this.getCurrentIndex();
    const currentRoute = routes[index];

    const showThanks = this.props.location.pathname.split('/').pop() === 'thanks';

    if (!currentRoute) {
      return <NotFound />;
    }

    return (
      <div className="text-left">
        <div style={overlayStyles(showThanks)}>
          <ThanksOverlay.GaussianBlur />
          <NavBar backButtonTarget={this.getDocsUrl()} title={currentRoute.label} />
          <ProgressBar step={index + 1} steps={routes.length} />
          <div className="container">
            <div className="row px-4">
              <DocumentFormRoutes onNext={this.onNext} />
            </div>
          </div>
          <div style={{ right: 0, bottom: 12, position: 'fixed' }}>
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
        {showThanks && (
          <ThanksOverlay
            header={thanksHeader}
            content={thanksContent}
            nextLabel="CHECK ANOTHER SERVICE"
            onNextSection={this.onNextSection}
          />
        )}
      </div>
    );
  }
}

export default DocsFormContainer;
