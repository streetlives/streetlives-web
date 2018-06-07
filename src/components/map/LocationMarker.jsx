import React, { Component } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import { withRouter } from 'react-router-dom';
import './LocationMarker.css';
import Button from '../button';

function renderPhone(phone) {
  const phoneLink = `tel:${phone.number}`;
  return (
    <a href={phoneLink} key={phone.id}>
      {phone.number}
    </a>
  );
}

function renderUrl(url) {
  const linkUrl = url.includes('//') ? url : `http://${url}`;
  return (
    <a href={linkUrl} target="_blank">
      {url}
    </a>
  );
}

function renderAddress(address) {
  const {
    id,
    address_1: address1,
    city,
    state_province: stateProvince,
    postal_code: postalCode,
  } = address;
  return (
    <div key={id}>
      <div>{address1}</div>
      <div>{`${city}, ${stateProvince} ${postalCode}`}</div>
    </div>
  );
}

class LocationMarker extends Component {
  constructor(props) {
    super(props);
    this.handleYesClick = this.handleYesClick.bind(this);
    this.onToggleInfo = this.onToggleInfo.bind(this);
  }

  onToggleInfo() {
    this.props.onToggleInfo(this.props.mapLocation.id);
  }

  handleYesClick() {
    this.props.history.push(`/location/${this.props.mapLocation.id}/recap`);
  }

  render() {
    const { mapLocation, isOpen } = this.props;
    const {
      Organization: organization,
      PhysicalAddresses: physicalAddresses,
      Phones: phones,
    } = mapLocation;
    const position = {
      lng: mapLocation.position.coordinates[0],
      lat: mapLocation.position.coordinates[1],
    };

    return (
      <Marker key={mapLocation.id} position={position} onClick={this.onToggleInfo}>
        {isOpen && (
          <InfoWindow
            options={{
              maxWidth: window.innerWidth - 100,
            }}
            onCloseClick={this.onToggleInfo}
          >
            <div
              style={{
                textAlign: 'left',
                maxHeight: window.innerHeight - 200,
                overflowY: 'auto',
              }}
            >
              <div>This location is:</div>
              <br />
              <div className="locationInfo" style={{ textAlign: 'center' }}>
                <div className="locationInfoHeader">
                  <div>{organization.name}</div>
                  {mapLocation.name && <div>{mapLocation.name}</div>}
                </div>
                <div>{physicalAddresses.map(renderAddress)}</div>
                <div>{organization.url && renderUrl(organization.url)}</div>
                <div>{phones.map(renderPhone)}</div>
              </div>
              <br />
              <div>
                Would you like to review, add, or edit<br /> information about this location?
              </div>
              <br />
              <Button primary fluid onClick={this.handleYesClick}>
                <span>YES</span>
              </Button>
              <div style={{ margin: '.5em' }} />
              <Button primary basic fluid onClick={this.onToggleInfo}>
                <span>NO THANKS</span>
              </Button>
            </div>
          </InfoWindow>
        )}
      </Marker>
    );
  }
}

export default withRouter(LocationMarker);
