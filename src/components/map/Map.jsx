import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { getAddressForLocation } from './geocodingUtil';
import config from '../../config';

const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultZoom = 14;
const minZoom = 11;
const geolocationTimeout = 5000;

const MyMap = compose(
  withProps({
    googleMapURL: config.googleMaps,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '100%' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  lifecycle({
    componentWillMount() {
      let mapRef;

      this.setState({
        onMapMounted: (ref) => {
          mapRef = ref;
        },
        onBoundsChanged: () => {
          if (!this.props.onBoundsChanged) {
            return;
          }

          const bounds = mapRef.getBounds();
          const center = bounds.getCenter();
          if (!bounds || !center) return;
          const radius = window.google.maps.geometry.spherical.computeDistanceBetween(
            center,
            bounds.getSouthWest(),
          );

          this.props.onBoundsChanged({ bounds, center, radius });
        },
      });
    },
  }),
  withScriptjs,
  withGoogleMap,
)(props => (
  <GoogleMap
    {...props}
    options={{
      minZoom,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      clickableIcons: false,
      styles: [
          {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [
                    { visibility: 'off' },
              ],
          },
      ],
    }}
    defaultZoom={defaultZoom}
    defaultCenter={defaultCenter}
    onClick={props.onMapClick}
    ref={props.onMapMounted}
  >
    {!!props.userPosition &&
      <Marker
        position={props.userPosition}
        zIndex={window.google.maps.Marker.MAX_ZINDEX + 1}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          strokeWeight: 4,
          strokeColor: '#FFFFFF',
          fillColor: '#4A90E2',
          fillOpacity: 1,
        }}
      />
    }
    {props.children}
  </GoogleMap>
));

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPosition: null,
    };
    this.onMapClick = this.onMapClick.bind(this);
  }

  componentDidMount() {
    if (!navigator || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (userPosition) => {
        const { coords } = userPosition;
        const location = {
          lat: coords.latitude,
          lng: coords.longitude,
        };

        this.setState({ userPosition: location });
      },
      // eslint-disable-next-line no-console
      e => console.error('Failed to get current position', e),
      { timeout: geolocationTimeout },
    );
  }

  onMapClick(clickEvent) {
    if (!this.props.onClick) {
      return;
    }

    getAddressForLocation(clickEvent.latLng)
      .then((address) => {
        const position = { coordinates: [clickEvent.latLng.lng(), clickEvent.latLng.lat()] };
        this.props.onClick({ position, address });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to get address for new location', err);
      });
  }

  render() {
    return (
      <MyMap
        {...this.props}
        onBoundsChanged={this.props.onBoundsChanged}
        onMapClick={this.onMapClick}
        userPosition={this.state.userPosition}
        center={this.props.center || this.state.userPosition || defaultCenter}
      />
    );
  }
}

Map.propTypes = {
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onBoundsChanged: PropTypes.func,
  onClick: PropTypes.func,
};

export default Map;
