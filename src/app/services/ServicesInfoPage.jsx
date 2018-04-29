import React, { Component } from 'react';
import Header from '../../components/header';
import Accordion from '../../components/accordion';
import Selector from '../../components/selector';

class ServicesInfoPage extends Component {
  state = { active: -1 };

  onToggleOpen = value =>
    this.setState(({ active }) => ({ active: active !== value ? value : -1 }));

  render() {
    const { active } = this.state;
    const { services } = this.props;

    return (
      <div className="text-left">
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
                  onClick={() => this.props.onSelectService('shelter', id)}
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
                  onClick={() => this.props.onSelectService('food', id)}
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
                  onClick={() => this.props.onSelectService('other', id)}
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
    );
  }
}

export default ServicesInfoPage;
