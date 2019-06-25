import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import LocationMarker from '../../components/map/LocationMarker';
import '../../components/map/LocationMarker.css';

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
    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
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

class ExistingLocationMarker extends Component {
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
    const { mapLocation } = this.props;
    const {
      Organization: organization,
      PhysicalAddresses: physicalAddresses,
      Phones: phones,
    } = mapLocation;

    return (
      <LocationMarker
        {...this.props}
        id={mapLocation.id}
        onClick={this.onToggleInfo}
        onSubmit={this.handleYesClick}
        onClose={this.onToggleInfo}
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
      </LocationMarker>
    );
  }
}

export default withRouter(ExistingLocationMarker);
