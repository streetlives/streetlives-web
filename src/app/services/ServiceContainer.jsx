import React, { Component } from 'react';
import Button from '../../components/button';
import NavBar from '../NavBar';
import ServicesInfoPage from './ServicesInfoPage';
import ServicesRecapPage from './ServicesRecapPage';

const data = {
  shelter: {
    1: { name: 'Community shelter' },
  },
  food: {
    1: { name: 'Soup Kitchen' },
    2: { name: 'Mobile Soup Kitchen' },
    3: { name: 'Food Panty' },
    4: { name: 'Brown Bag Lunch' },
  },
  other: {
    1: { name: 'Project ID' },
  },
};

const PAGES = {
  INFO: 'Services info',
  RECAP: 'Services recap',
};

class ServicesContainer extends Component {
  state = { page: PAGES.INFO, services: data };

  onNext = () => {
    if (this.state.page === PAGES.INFO) {
      this.setState({ page: PAGES.RECAP });
    }
  };

  onSelectService = (service, id) => {
    const { services } = this.state;
    services[service][id].selected = !services[service][id].selected;
    this.setState({ services });
  };

  render() {
    const { page, services } = this.state;
    return (
      <div className="text-left">
        <NavBar title={PAGES.INFO} />
        {page === PAGES.INFO && (
          <ServicesInfoPage services={services} onSelectService={this.onSelectService} />
        )}
        {page === PAGES.RECAP && <ServicesRecapPage services={services} />}
        <div className="position-absolute" style={{ right: 0, bottom: 0, left: 0 }}>
          <Button fluid primary onClick={this.onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  }
}

export default ServicesContainer;
