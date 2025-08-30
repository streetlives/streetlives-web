import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';

function extractStreetViewData(url) {
  if (!url) return null;
  const result = {};

  // Lat and Lng after @lat,lng
  const latLngMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (latLngMatch) {
    result.lat = parseFloat(latLngMatch[1]);
    result.lng = parseFloat(latLngMatch[2]);
  }

  // Heading: after h in the URL (e.g., 14.82h)
  const headingMatch = url.match(/,(\d+(?:\.\d+)?)h/);
  if (headingMatch) {
    result.heading = parseFloat(headingMatch[1]);
  }

  // Pitch: after t in the URL (e.g., 88.07t)
  const pitchMatch = url.match(/,(\d+(?:\.\d+)?)t/);
  if (pitchMatch) {
    result.pitch = parseFloat(pitchMatch[1]);
  }

  // FOV: after y in the URL (e.g., 75y)
  const fovMatch = url.match(/,(\d+(?:\.\d+)?)y/);
  if (fovMatch) {
    result.fov = parseFloat(fovMatch[1]);
  }

  // Pano ID: after !1s in the URL
  const panoMatch = url.match(/!1s([^!]+)/);
  if (panoMatch) {
    result.pano = panoMatch[1];
  }

  return result;
}

function LocationStreetviewView({ value, onConfirm, onEdit }) {
  const data = extractStreetViewData(value);
  const streetview = data ?  `${data.lat},${data.lng}&fov=${data.fov ?? 75}&heading=${data.heading ?? 0}&pano=${data.pano ?? ''}` : null;

  return (
    <div className="w-100">
      <div>
        {value ? <div>
          <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
            Here&quot;s the updated streetview
          </div>
          <img
            src={`https://maps.googleapis.com/maps/api/streetview?size=600x500&key=AIzaSyABZdHZ1R0cssL9BL9Kx3LpbmDfDJ6oPEc&fov=100&location=${streetview}`}
            loading="lazy"
            alt="Streetview of the location"
          />
        </div> : <p style={{ marginTop: 10 }}>EMPTY (Default Streetview)</p>}

      </div>

      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

LocationStreetviewView.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape),
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default LocationStreetviewView;

