import React, { Component } from 'react';
import { compose, withProps, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import LocationMarker from './LocationMarker';
import config from '../../config';

const MyMap = compose(
  withProps({
    googleMapURL: config.googleMaps,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '100%' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  lifecycle({
    componentWillMount(){
      let mapRef;

      this.setState({
        onMapMounted: (ref) => {
          mapRef = ref;
        },
        onBoundsChanged: () => {
          const bounds = mapRef.getBounds()
          const center = mapRef.getCenter()
          if(!bounds || !center) return;
          const radius = window.google.maps.geometry.spherical.computeDistanceBetween(
            center,
            {
              lat: () => bounds.f.b, lng: () => bounds.b.b
            }
          )
          this.props.onBoundsChanged({bounds, center, radius});
        }
      });
    }
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

class Map extends Component {
  constructor(props){
    super(props);
    this.state = {
      openLocationId: null
    };
    this.onToggleMarkerInfo = this.onToggleMarkerInfo.bind(this);
  }

  onToggleMarkerInfo(toggledLocationId){
    this.setState({
      openLocationId: this.state.openLocationId === toggledLocationId ? null : toggledLocationId,
    });
  }

  render(){
    return <MyMap 
      {...this.props}
      openLocationId={this.state.openLocationId}
      onToggleMarkerInfo={this.onToggleMarkerInfo}
      onBoundsChanged={this.props.onBoundsChanged}
      />
  }
}

export default Map;
