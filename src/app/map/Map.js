// TODO: Break down this file into a bunch of components, utils, etc.

import React, { Component } from "react";
import Amplify from 'aws-amplify';
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import { compose, withProps, withStateHandlers, lifecycle } from "recompose";
import axios from "axios";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import Button from "../../components/button";
import "./Map.css";

// TODO: Get the constants from some config or consts file.
// TODO: The default center should be the user's location.
const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultRadius = 10000;
const baseUrl = 'https://w6pkliozjh.execute-api.us-east-1.amazonaws.com/prod';

const defaultZoom = 14;
const minZoom = 11;

const fetchLocationsDebouncePeriod = 500;

class LocationMarker extends Component {
  onToggleInfo = () => {
    this.props.onToggleInfo(this.props.location.id);
  };

  renderAddress(address) {
    const { id, address_1, city, state_province, postal_code } = address;
    return (
      <div key={id}>
        <div>{address_1}</div>
        <div>{`${city}, ${state_province} ${postal_code}`}</div>
      </div>
    );
  }

  renderPhone(phone) {
    const phoneLink = `tel:${phone.number}`;
    return <a href={phoneLink} key={phone.id}>{phone.number}</a>;
  }

  renderUrl(url) {
    return <a href={url}>{url}</a>;
  }

  render() {
    // TODO: Change the API so the back-end returns this in a much nicer format.
    const { location, isOpen } = this.props;
    const {
      Organization: organization,
      PhysicalAddresses: physicalAddresses,
      Phones: phones,
    } = location;
    const position = {
      lng: location.position.coordinates[0],
      lat: location.position.coordinates[1],
    };

    return (
      <Marker
        key={location.id}
        position={position}
        onClick={this.onToggleInfo}
      >
        {isOpen && <InfoWindow onCloseClick={this.onToggleInfo}>
          <div className="locationInfo">
            <div className="locationInfoHeader">
              <div>{organization.name}</div>
              {location.name && <div>{location.name}</div>}
            </div>
            <div>{physicalAddresses.map(this.renderAddress)}</div>
            <div>{this.renderUrl(organization.url)}</div>
            <div>{phones.map(this.renderPhone)}</div>
          </div>
        </InfoWindow>}
      </Marker>
    );
  }
}

const MyMapComponent = compose(
  withProps({
    /**
     * Note: create and replace your own key in the Google console.
     * https://console.developers.google.com/apis/dashboard
     * The key "AIzaSyBkNaAGLEVq0YLQMi-PYEMabFeREadYe1Q" can be ONLY used in this sandbox (no forked).
     */
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCFMDqEgQ6VWWJbROzZhHu-f6sktAmTEGU&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withStateHandlers(() => ({
    openLocationId: null,
  }), {
    onToggleMarkerInfo: ({ openLocationId }) => (toggledLocationId) => ({
      openLocationId: openLocationId === toggledLocationId ? null : toggledLocationId,
    })
  }),
  // TODO: This is disgusting. I'm pretty amazed this is actually in the official examples.
  lifecycle({
    componentWillMount() {
      let mapRef;

      this.setState({
        onMapMounted: ref => {
          mapRef = ref;
        },
        onCenterChanged: () => {
          const center = mapRef.getCenter();
          this.props.onCenterChanged({ lat: center.lat(), lng: center.lng() });
        },
      });
    },
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap
    defaultZoom={defaultZoom}
    options={{ minZoom }}
    defaultCenter={defaultCenter}
    onCenterChanged={props.onCenterChanged}
    ref={props.onMapMounted}
  >
    {props.locations && (
      props.locations.map(
        location => (
          <LocationMarker
            key={location.id}
            location={location}
            isOpen={location.id === props.openLocationId}
            onToggleInfo={props.onToggleMarkerInfo}
          />
        )
      )
    )}
  </GoogleMap>
));

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
    // TODO: Re-integrate with AWS.
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
        <MyMapComponent
          locations={this.state && this.state.locations}
          onCenterChanged={this.onCenterChanged}
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
