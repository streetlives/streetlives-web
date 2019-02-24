import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import ExistingLocationMarker from './ExistingLocationMarker';
import NewLocationMarker from './NewLocationMarker';
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
    {props.locations &&
      props.locations.map(location => (
        <ExistingLocationMarker
          key={location.id}
          mapLocation={location}
          isOpen={location.id === props.openLocationId}
          onToggleInfo={props.onToggleMarkerInfo}
        />
      ))}
    {props.newLocation && (
      <NewLocationMarker
        key="new"
        mapLocation={props.newLocation}
        onClose={props.onNewLocationCancel}
      />
    )}
  </GoogleMap>
));

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openLocationId: null,
      newLocation: null,
      userPosition: null,
    };
    this.onToggleMarkerInfo = this.onToggleMarkerInfo.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.onNewLocationCancel = this.onNewLocationCancel.bind(this);
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

  onToggleMarkerInfo(toggledLocationId) {
    this.setState({
      openLocationId: this.state.openLocationId === toggledLocationId ? null : toggledLocationId,
      newLocation: null,
    });
  }

  onMapClick(clickEvent) {
    getAddressForLocation(clickEvent.latLng)
      .then((address) => {
        const { formattedAddress, ...addressComponents } = address;

        this.setState({
          newLocation: {
            position: { coordinates: [clickEvent.latLng.lng(), clickEvent.latLng.lat()] },
            address: addressComponents,
            formattedAddress,
          },
          openLocationId: null,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to get address for new location', err);
      });
  }

  onNewLocationCancel() {
    this.setState({ newLocation: null });
  }

  render() {
    return (
      <MyMap
        {...this.props}
        openLocationId={this.state.openLocationId}
        onToggleMarkerInfo={this.onToggleMarkerInfo}
        onBoundsChanged={this.props.onBoundsChanged}
        newLocation={this.state.newLocation}
        onNewLocationCancel={this.onNewLocationCancel}
        onMapClick={this.onMapClick}
        userPosition={this.state.userPosition}
        center={this.props.center || this.state.userPosition || defaultCenter}
      />
    );
  }
}

Map.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.object),
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onBoundsChanged: PropTypes.func,
};

export default Map;
