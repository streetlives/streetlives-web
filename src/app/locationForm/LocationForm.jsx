import React, { Component } from 'react';
import { Route } from 'react-router';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import Button from '../../components/button';
import Icon from '../../components/icon';
import routes from './routes';

class LocationForm extends Component {
  constructor(props) {
    super(props);

    this.onBack = this.onBack.bind(this);
    this.onNext = this.onNext.bind(this);
  }

  onBack() {
    this.props.history.push(`${routes[this.getCurrentIndex() - 1][0]}/${this.props.match.params.locationId}`);
  }

  onNext() {
    this.props.history.push( `${routes[this.getCurrentIndex() + 1][0]}/${this.props.match.params.locationId}`);
  }

  getCurrentIndex() {
    return routes.map(route => route[0].split('/').pop()).indexOf(this.props.match.params.id);
  }

  render() {
    const index = this.getCurrentIndex();
    const currentRoute = routes[index];

    // TODO: Pass the onFieldVerified prop so the form can progress to the next field.
    return (
      <div className="text-left">
        <NavBar title={currentRoute[2]} />
        <ProgressBar step={index + 1} steps={routes.length} />
        <div className="container">
          <div className="row px-4">
            {routes.map(route => <Route key={route[0]} path={`${route[0]}/:locationId`} component={route[1]} />)}
          </div>
        </div>
        <div className="position-absolute" style={{ right: 0, bottom: 12 }}>
          <div className="container">
            <div className="row px-4">
              <Button onClick={this.onBack} compact disabled={index === 0}>
                <Icon name="chevron-up" />
              </Button>
              <Button onClick={this.onNext} compact disabled={routes.length - 1 === index}>
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
