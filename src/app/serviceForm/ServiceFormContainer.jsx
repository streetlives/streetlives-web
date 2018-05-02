import React, { Component } from 'react';

import Button from '../../components/button';
import Icon from '../../components/icon';

import ServiceFormRoutes from './routes';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';

// eslint-disable-next-line
class ServiceFormContainer extends Component {
  render() {
    const { onBack, onNext, index } = this.props; // TODO
    return (
      <div className="text-left">
        <NavBar title="Service description" />
        <ProgressBar step={0} steps={10} />
        <div className="container">
          <div className="row px-4">
            <ServiceFormRoutes />
          </div>
        </div>
        <div className="position-absolute" style={{ right: 0, bottom: 12 }}>
          <div className="container">
            <div className="row px-4">
              <Button onClick={onBack} compact disabled={index === 0}>
                <Icon name="chevron-up" />
              </Button>
              <Button onClick={onNext} compact>
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
