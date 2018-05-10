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
    this.onInputFocus = this.onInputFocus.bind(this);
    this.onInputBlur = this.onInputBlur.bind(this);

    this.routeComponents = routes.map(({
        urlFragment, 
        RouteComponent,
        metaDataSection,
        fieldName,
      }) => (
      <Route
        key={urlFragment}
        path={`/location/:locationId/${urlFragment}/:thanks?`}
        render={(routeProps) => {
          return <RouteComponent 
            {...routeProps} 
            metaDataSection={metaDataSection}
            fieldName={fieldName}
            onInputFocus={this.onInputFocus}
            onInputBlur={this.onInputBlur}
            onFieldVerified={this.onNext} />;
        }}
      />
    ));
  }

  onBack() {
    const { locationId } = this.props.match.params;
    const { urlFragment } = routes[this.getCurrentIndex() - 1];
    this.props.history.push(`/location/${locationId}/${urlFragment}`);
    this.onInputBlur();
  }

  onNext() {
    const { locationId } = this.props.match.params;
    const idx = this.getCurrentIndex();
    if((routes.length - 1) === idx) {
      // show the overlay
      this.props.history.push(`${this.props.location.pathname}/thanks`);
    } else {
      const { [this.getCurrentIndex() + 1] : { urlFragment } } = routes;
      this.props.history.push(`/location/${locationId}/${urlFragment}`);
    }
    this.onInputBlur();
  }

  onInputFocus(){
    this.setState({inputFocused : true});
  }

  onInputBlur(){
    this.setState({inputFocused : false});
  }

  getCurrentIndex() {
    const { questionId } = this.props.match.params;
    return routes.map(({urlFragment}) => urlFragment.split('/').pop()).indexOf(questionId);
  }
  render() {
    const { locationId } = this.props.match.params;
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
          <NavBar 
            backButtonTarget={`/location/${locationId}`}
            title={currentRoute.label} />
          <ProgressBar step={index} steps={routes.length} />
          <div className="container">
            <div className="row px-4">{this.routeComponents}</div>
          </div>
          <div 
            className="position-absolute" 
            style={{ 
             right: 0,
             bottom: 12,
             display: this.state && this.state.inputFocused ? 'none' : 'block' 
            }}>
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
