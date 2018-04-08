import React, { Component } from "react";
import Amplify from 'aws-amplify';
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import axios from "axios";
import Map from "../../components/map";
import Button from "../../components/button";

// TODO: Get the constants from some config or consts file.
// TODO: The default center should be the user's location.
const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultRadius = 10000;
const baseUrl = 'https://w6pkliozjh.execute-api.us-east-1.amazonaws.com/prod';

const defaultZoom = 14;
const minZoom = 11;

const fetchLocationsDebouncePeriod = 500;

// TODO: Rename this, to make it clear this is the page, not the reusable component.
class Map extends Component {
  state = {
    searchString: '',
    center: defaultCenter,
    // TODO: Find a way to get new radius when bounds change (or use other param for bounding).
    radius: defaultRadius,
  };

  componentWillMount() {
    this.fetchLocations();
  }

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
        .catch((e) => console.log('error', e));
    })
  }, fetchLocationsDebouncePeriod);

  onChange = (event) => {
    this.setState({ searchString: event.target.value });
    this.fetchLocations();
  };

  onCenterChanged = (center) => {
    this.setState({ center });
    this.fetchLocations();
  };

  render() {
    return (
      <div className="Map">
        <h1>Map View</h1>
        <Map
          locations={this.state && this.state.locations}
          onCenterChanged={this.onCenterChanged}
          defaultZoom={defaultZoom}
          minZoom={minZoom}
          defaultCenter={defaultCenter}
        />
        <div><input onChange={this.onChange} /></div>
        <Button>Click Link</Button>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/form">Add location</Link>
        </div>
      </div>
    );
  }
}

export default Map;
