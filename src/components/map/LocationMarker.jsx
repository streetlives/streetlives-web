import React from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import Button from '../button';

function LocationMarker(props) {
  const {
    id,
    mapLocation,
    isOpen,
    onClick,
    onClose,
    onSubmit,
    children,
  } = props;
  const position = {
    lng: mapLocation.position.coordinates[0],
    lat: mapLocation.position.coordinates[1],
  };

  return (
    <Marker key={id} position={position} onClick={onClick}>
      {isOpen && (
        <InfoWindow
          options={{
            maxWidth: window.innerWidth - 100,
          }}
          onCloseClick={onClose}
        >
          <div
            style={{
              textAlign: 'left',
              maxHeight: window.innerHeight - 200,
              overflowY: 'auto',
            }}
          >
            {children}
            <br />
            <Button primary fluid onClick={onSubmit}>
              <span>YES</span>
            </Button>
            <div style={{ margin: '.5em' }} />
            <Button primary basic fluid onClick={onClose}>
              <span>NO THANKS</span>
            </Button>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
}

export default LocationMarker;
