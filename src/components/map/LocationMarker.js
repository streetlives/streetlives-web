import React, { Component } from "react";
import { Marker, InfoWindow } from "react-google-maps";
import "./LocationMarker.css";
import Button from '../button';

class LocationMarker extends Component {
  onToggleInfo = () => {
    this.props.onToggleInfo(this.props.location.id);
  };

  renderAddress(address) {
    const { id, address_1, city, state_province, postal_code } = address;
    return (
      <div key={id}>
        <div>{address_1}</div>
        <div>{`${city}, ${state_province} ${postal_code}`}</div>
      </div>
    );
  }

  renderPhone(phone) {
    const phoneLink = `tel:${phone.number}`;
    return <a href={phoneLink} key={phone.id}>{phone.number}</a>;
  }

  renderUrl(url) {
    const linkUrl = url.includes('//') ? url : `http://${url}`;
    return <a href={linkUrl} target="_blank">{url}</a>;
  }

  render() {
    const { location, isOpen } = this.props;
    const {
      Organization: organization,
      PhysicalAddresses: physicalAddresses,
      Phones: phones,
    } = location;
    const position = {
      lng: location.position.coordinates[0],
      lat: location.position.coordinates[1],
    };

    return (
      <Marker
        key={location.id}
        position={position}
        onClick={this.onToggleInfo}
      >
        {isOpen && <InfoWindow onCloseClick={this.onToggleInfo}>
          <div style={{textAlign:'left'}}>
            <div>This location is:</div>
            <br/>
            <div className="locationInfo" style={{textAlign:'center'}}>
              <div className="locationInfoHeader">
                <div>{organization.name}</div>
                {location.name && <div>{location.name}</div>}
              </div>
              <div>{physicalAddresses.map(this.renderAddress)}</div>
              <div>{this.renderUrl(organization.url)}</div>
              <div>{phones.map(this.renderPhone)}</div>
            </div>
            <br/>
            <div>Would you like to review, add, or edit<br/> information about this location?</div>
            <br/>
            <Button primary fluid onClick={() => {}}>
              <span>YES</span>
            </Button>
            <div style={{margin:'.5em'}}/>
            <Button primary basic fluid onClick={() => {}}>
              <span>NO THANKS</span>
            </Button>
          </div>
          
        </InfoWindow>}
      </Marker>
    );
  }
}

export default LocationMarker;
