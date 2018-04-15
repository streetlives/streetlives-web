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

    this.routes = [
      ["/questions/entrance-picture", LocationImage],
      ["/questions/location-address", LocationAddress],
      ["/questions/organization-name", null],
      ["/questions/location-name", LocationName],
      ["/questions/location-description", null],
      ["/questions/phone-number", LocationNumber],
      ["/questions/website", LocationWebsite],
      ["/questions/additional-info", null]
    ];

    this.onBack = this.onBack.bind(this);
    this.onNext = this.onNext.bind(this);

    const { params } = props.match;
  }

  getCurrentIndex() {
    return this.routes.map( route => route[0] ).indexOf(this.props.location.pathname);
  }

  onBack() {
    this.props.history.push(this.routes[this.getCurrentIndex()-1][0]);
  }

  onNext() {
    this.props.history.push(this.routes[this.getCurrentIndex()+1][0]);
  }

  render() {
    const index = this.getCurrentIndex();
    return (
      <div className="text-left">
        <NavBar title="Entrance Picture" />
        <ProgressBar step={index + 1} />
        <div className="container">
          <div className="row px-4">
            { this.routes.map( route => <Route key={route[0]} path={route[0]} component={route[1]} />) } 
          </div>
        </div>
        <div className="position-absolute" style={{ right: 0, bottom: 12 }}>
          <div className="container">
            <div className="row px-4">
              <Button onClick={this.onBack} compact disabled={index === 0}>
                <Icon name="chevron-up" />
              </Button>
              <Button onClick={this.onNext} compact disabled={(this.routes.length - 1) === index}>
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
