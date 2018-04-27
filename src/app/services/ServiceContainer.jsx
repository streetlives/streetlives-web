import React, { Component } from 'react';
import Header from '../../components/header';
import Button from '../../components/button';
import Accordion from '../../components/accordion';
import NavBar from '../NavBar';

// eslint-disable-next-line
class ServicesContainer extends Component {
  state = { active: -1 };

  onOpen = value => this.setState({ active: value });

  render() {
    const { active } = this.state;
    return (
      <div className="text-left">
        <NavBar title="Services Info" />
        <div className="py-5 px-3 container">
          <Header>What programs and services are available at this location?</Header>
        </div>
        <Accordion>
          <Accordion.Item
            active={active === 0}
            onClick={() => this.onOpen(0)}
            title="Shelter"
            icon="home"
          />
          <Accordion.Content active={active === 0}>This is test content</Accordion.Content>

          <Accordion.Item
            active={active === 1}
            onClick={() => this.onOpen(1)}
            title="Food"
            icon="cutlery"
          />
          <Accordion.Content active={active === 1}>This is test content</Accordion.Content>

          <Accordion.Item
            active={active === 2}
            onClick={() => this.onOpen(2)}
            title="Other Services"
            icon="ellipsis-h"
          />
          <Accordion.Content active={active === 2}>This is test content</Accordion.Content>
        </Accordion>

        <div className="position-absolute" style={{ right: 0, bottom: 0, left: 0 }}>
          <Button fluid primary>
            Next
          </Button>
        </div>
      </div>
    );
  }
}

export default ServicesContainer;
