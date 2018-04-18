import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import { getLocations } from '../../services/api';
import Map from '../../components/map';

const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultRadius = 10000;

const defaultZoom = 14;
const minZoom = 11;

const geolocationTimeout = 5000;
const fetchLocationsDebouncePeriod = 500;

class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchString: '',
      center: defaultCenter,
      radius: defaultRadius,
    };
  }

  componentWillMount() {
    this.fetchLocations();
  }

  componentDidMount() {
    if (!navigator || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (userPosition) => {
        const { coords } = userPosition;
        this.onCenterChanged({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      e => console.error('Failed to get current position', e), // eslint-disable-line no-console
      { timeout: geolocationTimeout },
    );
  }

  onSearchChanged(event) {
    this.setState({ searchString: event.target.value }, () => {
      this.fetchLocations();
    });
  }

  onCenterChanged(center) {
    this.setState({ center }, () => {
      this.fetchLocations();
    });
  }

  fetchLocations() {
    debounce(() => {
      getLocations({
        latitude: this.state.center.lat,
        longitude: this.state.center.lng,
        radius: this.state.radius,
        searchString: this.state.searchString,
      })
        .then(locations => this.setState({ locations }))
        .catch(e => console.error('error', e)); // eslint-disable-line no-console
    }, fetchLocationsDebouncePeriod);
  }

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
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '3.2em',
            right: 0,
            bottom: 0,
          }}
        >
          <Map
            locations={this.state && this.state.locations}
            options={{ minZoom, disableDefaultUI: true }}
            defaultZoom={defaultZoom}
            defaultCenter={defaultCenter}
            center={this.state.center}
            onCenterChanged={this.onCenterChanged}
          />
        </div>
      </div>
    );
  }
}

export default MapView;
