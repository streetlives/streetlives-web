import React, { Component } from 'react';
import { Route } from 'react-router';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import Button from '../../components/button';
import Icon from '../../components/icon';
import routes from './routes';
import ThanksOverlay from './thanks/ThanksOverlay';

class LocationForm extends Component {
  constructor(props) {
    super(props);

    this.onBack = this.onBack.bind(this);
    this.onNext = this.onNext.bind(this);

    this.routeComponents = routes.map(route => (
      <Route
        key={route[0]}
        path={`/location/:locationId/${route[0]}/:thanks?`}
        render={(routeProps) => {
          const RouteComponent = route[1];
          return <RouteComponent {...routeProps} onFieldVerified={this.onNext} />;
        }}
      />
    ));
  }

  onBack() {
    const { locationId } = this.props.match.params;
    const prevRoute = routes[this.getCurrentIndex() - 1];
    this.props.history.push(`/location/${locationId}/${prevRoute[0]}`);
  }

  onNext() {
    const { locationId } = this.props.match.params;
    const idx = this.getCurrentIndex();
    if((routes.length - 1) === idx) {
      // show the overlay
      this.props.history.push(`${this.props.location.pathname}/thanks`);
    } else {
      this.props.history.push(`/location/${locationId}/${routes[this.getCurrentIndex() + 1][0]}`);
    }
  }

  getCurrentIndex() {
    const { questionId } = this.props.match.params;
    return routes.map(route => route[0].split('/').pop()).indexOf(questionId);
  }
  render() {
    const index = this.getCurrentIndex();
    const currentRoute = routes[index];
    const thanks = this.props.location.pathname.split('/').pop() === 'thanks';

    return (
      <div className="text-left">
        <div style={{
            filter : thanks && 'url(#blur)', 
            overflow : thanks && 'hidden',
            width:'100%', 
            height:'100%' 
          }}>
          <svg style={{display:'none'}}>
             <filter id="blur">
                 <feGaussianBlur stdDeviation="4"/>
             </filter>
          </svg>
          <NavBar title={currentRoute[2]} />
          <ProgressBar step={index} steps={routes.length} />
          <div className="container">
            <div className="row px-4">{this.routeComponents}</div>
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
        {
           thanks && <ThanksOverlay />
        }
      </div>
    );
  }
}

export default LocationForm;
