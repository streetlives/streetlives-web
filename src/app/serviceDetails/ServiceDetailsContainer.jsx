import React, { Component } from 'react';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import Header from '../../components/header';

function ServiceHeader({ children }) {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">{children}</Header>
      </div>
    </div>
  );
}

// eslint-disable-next-line
class ServiceDetailsContainer extends Component {
  render() {
    return (
      <div className="text-left">
        <NavBar title="Service Details" />
        <div className="mb-5">
          <ProgressBar step={1} steps={10} />
        </div>
        <ServiceHeader>Check all the Soup Kitchen details</ServiceHeader>
      </div>
    );
  }
}

export default ServiceDetailsContainer;
