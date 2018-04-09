import React, { Component } from "react";
import Amplify from 'aws-amplify';
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import axios from "axios";
import Map from "../../components/map";

// TODO: Get the constants from some config or consts file.
const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultRadius = 10000;
const baseUrl = 'https://w6pkliozjh.execute-api.us-east-1.amazonaws.com/prod';

const defaultZoom = 14;
const minZoom = 11;

const geolocationTimeout = 5000;
const fetchLocationsDebouncePeriod = 500;

class MapView extends Component {
  state = {
    searchString: '',
    center: defaultCenter,
    // TODO: Find a way to get new radius when bounds change (or use other param for bounding).
    radius: defaultRadius,
  };

  fetchLocations = debounce(() => {
    // TODO: The API requests should be encapsulated behind a dedicated module.
    Amplify.Auth.currentAuthenticatedUser().then((user) => {
      console.log('user',user)
      const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();
      const params = {
        latitude: this.state.center.lat,
        longitude: this.state.center.lng,
        radius: this.state.radius,
        searchString: this.state.searchString,
      };

      axios.request({
          url : `${baseUrl}/locations`,
          method : 'get',
          params,
          headers : {
            Authorization : idJwtToken
          }
        })
        .then((result) => this.setState({ locations : result.data }))
        .catch((e) => console.error('error', e));
    })
  }, fetchLocationsDebouncePeriod);

  onSearchChanged = (event) => {
    this.setState({ searchString: event.target.value }, () => {
      this.fetchLocations();
    });
  };

  onCenterChanged = (center) => {
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
      (userPosition) => {
        const { coords } = userPosition;
        this.onCenterChanged({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      (e) => console.error('Failed to get current position', e),
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
        <div>Search: <input onChange={this.onSearchChanged} /></div>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/form">Add location</Link>
        </div>
      </div>
    );
  }
}

export default MapView;
