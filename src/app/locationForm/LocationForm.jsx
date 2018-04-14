import React, { Component } from 'react';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import Header from '../../components/header';
import Button from '../../components/button';
import Icon from '../../components/icon';

function FormQuestion() {
  return (
    <div>
      <Header>Please take a picture of this location&apos;s main street entrance</Header>
      <Button onClick={() => {}} primary className="mt-3">
        <Icon name="camera" size="lg" />
      </Button>
    </div>
  );
}

class LocationForm extends Component {
  constructor(props) {
    super(props);

    this.onIncrement = this.onIncrement.bind(this);
    this.onDecrement = this.onDecrement.bind(this);

    this.state = { index: 0 };
  }

  onIncrement() {
    this.setState(({ index }) => ({ index: index + 1 }));
  }

  onDecrement() {
    this.setState(({ index }) => ({ index: index - 1 }));
  }

  render() {
    const { index } = this.state;
    return (
      <div className="text-left">
        <NavBar title="Entrance Picture" />
        <ProgressBar step={index} />
        <div className="container">
          <div className="row px-4">
            <FormQuestion />
          </div>
        </div>
        <div className="position-absolute" style={{ right: 0, bottom: 12 }}>
          <div className="container">
            <div className="row px-4">
              <Button onClick={this.onDecrement} compact disabled={index === 0}>
                <Icon name="chevron-up" />
              </Button>
              <Button onClick={this.onIncrement} compact disabled={index === 10}>
                <Icon name="chevron-down" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LocationForm;
