import React, { Component } from 'react';

import Header from '../../../components/header';
import Accordion from '../../../components/accordion';
import Selector from '../../../components/selector';
import Button from '../../../components/button';

import NavBar from '../../NavBar';

const FAKE_DATA = {
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

class ServiceCategories extends Component {
  state = { active: -1, services: FAKE_DATA };

  onNext = () => console.log('Next clicked'); // eslint-disable-line no-console

  onToggleOpen = value =>
    this.setState(({ active }) => ({ active: active !== value ? value : -1 }));

  onSelectService = (service, id) => {
    const { services } = this.state;
    services[service][id].selected = !services[service][id].selected;
    this.setState({ services });
  };

  render() {
    const { active, services } = this.state;

    return (
      <div className="text-left">
        <NavBar title="Services info" />
        <div className="mb-5">
          <div className="py-5 px-3 container">
            <Header>What programs and services are available at this location?</Header>
          </div>
          <Accordion>
            <Accordion.Item
              active={active === 0}
              onClick={() => this.onToggleOpen(0)}
              title="Shelter"
              icon="home"
            />
            <Accordion.Content active={active === 0}>
              <Selector fluid>
                {Object.keys(services.shelter).map(id => (
                  <Selector.Option
                    key={id}
                    onClick={() => this.onSelectService('shelter', id)}
                    active={services.shelter[id].selected}
                  >
                    {services.shelter[id].name}
                  </Selector.Option>
                ))}
                <Selector.Option align="center">+ Add another shelter service</Selector.Option>
              </Selector>
            </Accordion.Content>

            <Accordion.Item
              active={active === 1}
              onClick={() => this.onToggleOpen(1)}
              title="Food"
              icon="cutlery"
            />
            <Accordion.Content active={active === 1}>
              <Selector fluid>
                {Object.keys(services.food).map(id => (
                  <Selector.Option
                    key={id}
                    onClick={() => this.onSelectService('food', id)}
                    active={services.food[id].selected}
                  >
                    {services.food[id].name}
                  </Selector.Option>
                ))}
                <Selector.Option align="center">+ Add another food service</Selector.Option>
              </Selector>
            </Accordion.Content>

            <Accordion.Item
              active={active === 2}
              onClick={() => this.onToggleOpen(2)}
              title="Other Services"
              icon="ellipsis-h"
            />
            <Accordion.Content active={active === 2}>
              <Selector fluid>
                {Object.keys(services.other).map(id => (
                  <Selector.Option
                    key={id}
                    onClick={() => this.onSelectService('other', id)}
                    active={services.other[id].selected}
                  >
                    {services.other[id].name}
                  </Selector.Option>
                ))}
                <Selector.Option align="center">+ Add another service</Selector.Option>
              </Selector>
            </Accordion.Content>
          </Accordion>
        </div>
        <div className="position-fixed" style={{ right: 0, bottom: 0, left: 0 }}>
          <Button fluid primary onClick={this.onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  }
}

export default ServiceCategories;
