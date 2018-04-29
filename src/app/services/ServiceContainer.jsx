import React, { Component } from 'react';
import Header from '../../components/header';
import Button from '../../components/button';
import Accordion from '../../components/accordion';
import NavBar from '../NavBar';
import Selector from '../../components/selector';

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

// eslint-disable-next-line
class ServicesContainer extends Component {
  state = { active: -1, services: data };

  onToggleOpen = value =>
    this.setState(({ active }) => ({ active: active !== value ? value : -1 }));

  onToggleService = (service, id) => {
    const { services } = this.state;
    services[service][id].selected = !services[service][id].selected;
    this.setState({ services });
  };

  onNext = () => {
    console.log('onNext');
  };

  render() {
    const { active, services } = this.state;
    return (
      <div className="text-left">
        <NavBar title="Services Info" />
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
                  onClick={() => this.onToggleService('shelter', id)}
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
                  onClick={() => this.onToggleService('food', id)}
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
                  onClick={() => this.onToggleService('other', id)}
                  active={services.other[id].selected}
                >
                  {services.other[id].name}
                </Selector.Option>
              ))}
              <Selector.Option align="center">+ Add another service</Selector.Option>
            </Selector>
          </Accordion.Content>
        </Accordion>

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
