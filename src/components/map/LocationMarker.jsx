import React, { Component } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import Button from '../button';
import OverlayView from './OverlayView';

const MARKER_ICON_MAPPINGS = {
  /* eslint-disable max-len */
  blue: 'https://www.google.com/maps/vt/icon/name=assets/icons/spotlight/spotlight_pin_v2_shadow-1-small.png,assets/icons/spotlight/spotlight_pin_v2-1-small.png,assets/icons/spotlight/spotlight_pin_v2_dot-1-small.png,assets/icons/spotlight/spotlight_pin_v2_accent-1-small.png&highlight=000000,1400FF,FFFFFF,000000&color=1400FF?scale=1',
  gray: 'https://www.google.com/maps/vt/icon/name=assets/icons/spotlight/spotlight_pin_v2_shadow-1-small.png,assets/icons/spotlight/spotlight_pin_v2-1-small.png,assets/icons/spotlight/spotlight_pin_v2_dot-1-small.png,assets/icons/spotlight/spotlight_pin_v2_accent-1-small.png&highlight=000000,C0C0C0,FFFFFF,000000&color=C0C0C0?scale=1',
  /* eslint-enable max-len */
};

// react-google-maps compares props by identity and pushes any change straight to the Google Maps
// marker (setIcon/setPosition). A fresh object literal per render would therefore make every marker
// on the map redraw itself whenever the map page re-renders, so these are cached.
const iconsByColor = {};
const getIcon = (color) => {
  if (!iconsByColor[color]) {
    iconsByColor[color] = { url: MARKER_ICON_MAPPINGS[color] };
  }
  return iconsByColor[color];
};

class LocationMarker extends Component {
  getPosition() {
    const [lng, lat] = this.props.mapLocation.position.coordinates;

    if (!this.position || this.position.lat !== lat || this.position.lng !== lng) {
      this.position = { lat, lng };
    }

    return this.position;
  }

  render() {
    const {
      id,
      isOpen,
      onClick,
      onClose,
      onSubmit,
      children,
      locationUrl,
      color = 'blue',
    } = this.props;
    const position = this.getPosition();

    const marker = (
      <Marker
        position={position}
        onClick={onClick}
        icon={getIcon(color)}
      >
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

    // The overlay only exists to put a crawlable <a> on the map. Without a URL it would render
    // nothing while still costing a repositioned DOM node per marker on every pan frame.
    if (!locationUrl) {
      return marker;
    }

    return (
      <OverlayView key={id} position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
        <a href={locationUrl}>{marker}</a>
      </OverlayView>
    );
  }
}

export default LocationMarker;
