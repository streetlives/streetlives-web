import React, { Component } from 'react';
import { Route } from 'react-router';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import Button from '../../components/button';
import Icon from '../../components/icon';
import LocationImage from './image/LocationImage';
import LocationAddress from './address/LocationAddress';
import LocationName from './name/LocationName';
import LocationNumber from './number/LocationNumber';
import LocationWebsite from './website/LocationWebsite';

class LocationForm extends Component {
  constructor(props) {
    super(props);

    this.onBack = this.onBack.bind(this);
    this.onNext = this.onNext.bind(this);

    const { params } = props.match;
    this.state = { index: Number(params.id) };
  }

  onBack() {
    const { index } = this.state;
    this.setState({ index: index - 1 });
    this.props.history.push(`/questions/${index - 1}`);
  }

  onNext() {
    const { index } = this.state;
    this.setState({ index: index + 1 });
    this.props.history.push(`/questions/${index + 1}`);
  }

  render() {
    const { index } = this.state;
    return (
      <div className="text-left">
        <NavBar title="Entrance Picture" />
        <ProgressBar step={index} />
        <div className="container">
          <div className="row px-4">
            <Route path="/questions/1" component={LocationImage} />
            <Route path="/questions/2" component={LocationName} />
            <Route path="/questions/3" component={LocationAddress} />
            <Route path="/questions/4" component={LocationNumber} />
            <Route path="/questions/5" component={LocationWebsite} />
          </div>
        </div>
        <div className="position-absolute" style={{ right: 0, bottom: 12 }}>
          <div className="container">
            <div className="row px-4">
              <Button onClick={this.onBack} compact disabled={index === 0}>
                <Icon name="chevron-up" />
              </Button>
              <Button onClick={this.onNext} compact disabled={index === 10}>
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
