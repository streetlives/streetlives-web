import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
  state = {
    searchString: '',
    center: defaultCenter,
    radius: defaultRadius,
  };

  fetchLocations = debounce(() => {
    getLocations({
      latitude: this.state.center.lat,
      longitude: this.state.center.lng,
      radius: this.state.radius,
      searchString: this.state.searchString,
    })
      .then(locations => this.setState({ locations }))
      .catch(e => console.error('error', e));
  }, fetchLocationsDebouncePeriod);

  onSearchChanged = event => {
    this.setState({ searchString: event.target.value }, () => {
      this.fetchLocations();
    });
  };

  onCenterChanged = center => {
    this.setState({ center }, () => {
      this.fetchLocations();
    });
  };

  componentWillMount() {
    this.fetchLocations();
  }

  componentDidMount() {
    if (!navigator || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      userPosition => {
        const { coords } = userPosition;
        this.onCenterChanged({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      e => console.error('Failed to get current position', e),
      { timeout: geolocationTimeout },
    );
  }

  render() {
    return (
      <div className="Map">
        <h1>Map View</h1>
        <Map
          locations={this.state && this.state.locations}
          options={{ minZoom }}
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
          center={this.state.center}
          onCenterChanged={this.onCenterChanged}
        />
        <div>
          Search: <input onChange={this.onSearchChanged} />
        </div>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/form">Add location</Link>
        </div>
      </div>
    );
  }
}

export default MapView;
