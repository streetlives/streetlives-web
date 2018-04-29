import React, { Component } from 'react';
import Header from '../../components/header';
import Button from '../../components/button';
import NavBar from '../NavBar';

// eslint-disable-next-line
class ServicesContainer extends Component {
  render() {
    return (
      <div>
        <NavBar title="Services Info" />
        <Header>What programs and services are available at this location?</Header>
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
