import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
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
          this.props.onMapMounted(ref);
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

  componentWillReceiveProps(nextProps) {
    if (!window.google ||
      this.props.zoomedLocations === nextProps.zoomedLocations ||
      !nextProps.zoomedLocations) {
      return;
    }

    const oldBounds = this.mapRef.getBounds();

    const zoomedOutBounds = oldBounds;
    nextProps.zoomedLocations.forEach((location) => {
      zoomedOutBounds.extend(new window.google.maps.LatLng(
        location.position.coordinates[1],
        location.position.coordinates[0],
      ));
    });

    this.mapRef.fitBounds(zoomedOutBounds, 0);
  }

  onMapMounted = (ref) => {
    this.mapRef = ref;
  };

  render() {
    return (
      <MyMap
        {...this.props}
        onMapMounted={this.onMapMounted}
        userPosition={this.state.userPosition}
        center={this.props.center || this.state.userPosition || defaultCenter}
      />
    );
  }
}

Map.propTypes = {
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  zoomedLocations: PropTypes.arrayOf(PropTypes.object),
  onBoundsChanged: PropTypes.func,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export default Map;
