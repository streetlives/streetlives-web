import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import { getLocations } from '../../services/api';
import Map from '../../components/map';
/* eslint-env es6 */

const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultZoom = 14;
const minZoom = 11;

const geolocationTimeout = 5000;
const fetchLocationsDebouncePeriod = 500;

export default class MapView extends Component {
  state = {
    searchString: '',
    center: defaultCenter,
    radius: null,
  };

  componentWillMount() {
    this.fetchLocations();
  }

  componentDidMount() {
    if (!navigator || !navigator.geolocation) {
      return;
    }
  }
  onSearchChanged = event => {
    this.setState({ searchString: event.target.value }, () => {
      //this.fetchLocations();
    });
  };

  onBoundsChanged = ({center, radius}) => {
    this.setState({ center: {lat: center.lat(), lng: center.lng()} , radius }, () => {
      this.fetchLocations();
    });
  }

  fetchLocations = () => {
    if(!this.state.radius) return;
    getLocations({
      latitude: this.state.center.lat,
      longitude: this.state.center.lng,
      radius: Math.floor(this.state.radius),
      searchString: this.state.searchString,
    })
      .then(locations => this.setState({ locations }))
      .catch(e => console.error('error', e));
  };

  render() {
    return (
      <div className="Map">
        <div
          style={{
            backgroundColor: '#323232',
            position: 'absolute',
            left: 0,
            top: '0em',
            right: 0,
          }}
        >
          <div className="input-group" style={{ padding: '.5em' }}>
            <div className="input-group-prepend">
              <span
                style={{ backgroundColor: 'white', border: 'none', borderRadius: 0 }}
                className="input-group-text"
              >
                <i className="fa fa-search" />
              </span>
            </div>
            <input
              onChange={this.onSearchChanged}
              style={{ border: 'none', borderRadius: 0 }}
              type="text"
              className="form-control"
              placeholder="Type the address, or drop a pin"
              required
            />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, top: '3.2em', right: 0, bottom: 0 }}>
          <Map
            locations={this.state && this.state.locations}
            options={{ 
              minZoom, 
              disableDefaultUI: true, 
              gestureHandling: 'greedy',
              clickableIcons: false,
              styles:[
                  {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [
                            { visibility: "off" }
                      ]
                  }
              ]
            }}
            defaultZoom={defaultZoom}
            defaultCenter={defaultCenter}
            onBoundsChanged={this.onBoundsChanged}
          />
        </div>
      </div>
    );
  }
}
