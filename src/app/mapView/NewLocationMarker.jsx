import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { startCreatingNewLocation } from 'actions';
import LocationMarker from 'components/map/LocationMarker';
import 'components/map/LocationMarker.css';

class NewLocationMarker extends Component {
  constructor(props) {
    super(props);
    this.addNewLocation = this.addNewLocation.bind(this);
  }

  addNewLocation() {
    const { mapLocation } = this.props;
    const position = {
      longitude: mapLocation.position.coordinates[0],
      latitude: mapLocation.position.coordinates[1],
    };
    this.props.startCreatingNewLocation(position, mapLocation.address);
    this.props.history.push('/location');
  }

  render() {
    const { mapLocation } = this.props;
    const { formattedAddress } = mapLocation;

    return (
      <LocationMarker
        {...this.props}
        isOpen
        id="newMarker"
        onClick={() => {}}
        onSubmit={this.addNewLocation}
      >
        <div className="locationInfo" style={{ textAlign: 'center' }}>
          <div className="locationInfoHeader">
            {formattedAddress}
          </div>
        </div>
        <br />
        <div>
          Is not a part of Streetlives yet.<br />Do you want to add this location to the map?
        </div>
        <br />
      </LocationMarker>
    );
  }
}

const mapDispatchToProps = ({ startCreatingNewLocation });

export default connect(null, mapDispatchToProps)(withRouter(NewLocationMarker));
