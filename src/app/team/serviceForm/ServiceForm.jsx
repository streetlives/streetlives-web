import React from 'react';

import Button from '../../../components/button';
import Icon from '../../../components/icon';
import ProgressBar from '../../../components/progressBar';
import NavBar from '../../../components/navBar';

import NotFound from '../../notFound/NotFound';

import ThanksOverlay, { overlayStyles } from '../locationForm/thanks/ThanksOverlay';

const thanksHeader = 'Fantastic!';
const thanksContent =
  "You're making it easier for people to get the help they need because of the work you're doing.";

const ServiceForm = ({
  onNext,
  onBack,
  backButtonTarget,
  currentIndex,
  currentRoute,
  totalRoutes,
  showThanks,
  onNextSection,
  children,
}) => {
  if (!currentRoute) {
    return <NotFound />;
  }

  return (
    <div className="text-left">
      <div style={overlayStyles(showThanks)}>
        <ThanksOverlay.GaussianBlur />
        <NavBar
          backButtonTarget={backButtonTarget}
          title={currentRoute.label}
        />
        <ProgressBar step={currentIndex + 1} steps={totalRoutes} />
        <div
          style={{ marginBottom: '5em' }}
          className="container"
        >
          <div className="row px-4">
            {children}
          </div>
        </div>
        <div style={{ right: 0, bottom: 12, position: 'fixed' }}>
          <div
            className="container"
          >
            <div className="row px-4">
              <Button onClick={onBack} compact disabled={currentIndex === 0}>
                <Icon name="chevron-up" />
              </Button>
              <Button onClick={onNext} compact disabled={totalRoutes - 1 === currentIndex}>
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
          onNextSection={onNextSection}
        />
      )}
    </div>
  );
};

export default ServiceForm;
