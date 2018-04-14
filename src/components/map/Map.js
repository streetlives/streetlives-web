import React from "react";
import { compose, withProps, withStateHandlers, lifecycle } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";
import LocationMarker from './LocationMarker';
import urls from "../../constants/urls";

const Map = compose(
  withProps({
    googleMapURL: urls.googleMaps,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `100%` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withStateHandlers(() => ({
    openLocationId: null,
  }), {
    onToggleMarkerInfo: ({ openLocationId }) => (toggledLocationId) => ({
      openLocationId: openLocationId === toggledLocationId ? null : toggledLocationId,
    })
  }),
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
