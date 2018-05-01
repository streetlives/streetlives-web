import React from 'react';
import { compose, withProps, withStateHandlers, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import LocationMarker from './LocationMarker';
import config from '../../config';
import debounce from 'lodash/debounce';

const onBoundsChangedDebouncePeriod = 500;
const Map = compose(
  withProps({
    googleMapURL: config.googleMaps,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '100%' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  withStateHandlers(
    () => ({
      openLocationId: null,
    }),
    {
      onToggleMarkerInfo: ({ openLocationId }) => toggledLocationId => ({
        openLocationId: openLocationId === toggledLocationId ? null : toggledLocationId,
      }),
    },
  ),
  lifecycle({
    componentWillMount() {
      let mapRef;

      this.setState({
        onMapMounted: (ref) => {
          mapRef = ref;
        },
        onBoundsChanged: () => {
          const bounds = mapRef.getBounds()
          const center = mapRef.getCenter()
          const radius = window.google.maps.geometry.spherical.computeDistanceBetween(
            center,
            {
              lat: () => bounds.f.b, lng: () => bounds.b.b
            }
          )
          this.props.onBoundsChanged({bounds, center, radius});
        }
      });
    },
  }),
  withScriptjs,
  withGoogleMap,
)(props => (
  <GoogleMap {...props} ref={props.onMapMounted}>
    {props.locations &&
      props.locations.map(location => (
        <LocationMarker
          key={location.id}
          mapLocation={location}
          isOpen={location.id === props.openLocationId}
          onToggleInfo={props.onToggleMarkerInfo}
        />
      ))}
  </GoogleMap>
));

export default Map;
