import React, { Component } from "react";
import Amplify from 'aws-amplify';
import { Link } from "react-router-dom";
import Button from "../../components/button";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";

const MyMapComponent = compose(
  withProps({
    /**
     * Note: create and replace your own key in the Google console.
     * https://console.developers.google.com/apis/dashboard
     * The key "AIzaSyBkNaAGLEVq0YLQMi-PYEMabFeREadYe1Q" can be ONLY used in this sandbox (no forked).
     */
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap defaultZoom={8} defaultCenter={{ lat: 40.7831, lng: -73.9712 }}>
    {props.locations && (
      props.locations.map(
        (l, i) => <Marker key={i} position={{ lat: l.st_x, lng: l.st_y }} />
      )
    )}
  </GoogleMap>
));

class Map extends Component {

  componentWillMount(){
    Amplify.Auth.currentAuthenticatedUser().then((user) => {
      console.log('user',user)
      const apigClient = window.apigClientFactory.newClient();
      const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();
      apigClient.locationsGet(
        {},
        {},
        {
          headers : {
            Authorization : idJwtToken 
          }
        })
        .then((result) => this.setState({locations : result.data.body}))
        .catch( (e) => console.log('error', e) )
    });
  }
  render() {
    return (
      <div className="Map">
        <h1>Map View</h1>
        <MyMapComponent locations={this.state && this.state.locations} />
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
