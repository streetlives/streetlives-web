import React from "react";
import { compose, withProps, withStateHandlers, lifecycle } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";
import LocationMarker from './LocationMarker';

const Map = compose(
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
          if (this.props.onCenterChanged) {
            this.props.onCenterChanged({ lat: center.lat(), lng: center.lng() });
          }
        },
      });
    },
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap
    {...props}
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

export default Map;
