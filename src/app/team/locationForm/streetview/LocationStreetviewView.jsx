import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';
import config from '../../../../config';
import { buildStreetviewImageUrl } from './utils';

// Both previews are built by the one function YourPeer's is built by, so the picture the
// specialist confirms here is the picture yourpeer.nyc publishes — including when there is
// no override at all and Google chooses the direction for us.
function buildImageUrl(resourceData, streetview) {
  const coords = resourceData && resourceData.position && resourceData.position.coordinates;
  return buildStreetviewImageUrl(
    {
      // GeoJSON order: [lng, lat].
      lat: coords ? coords[1] : null,
      lng: coords ? coords[0] : null,
      streetview,
    },
    // 5:3, matching the edit panorama and YourPeer's location-detail preview.
    { size: '600x360', key: config.googleMapApiKey },
  );
}

const DEFAULT_SHOWN_MESSAGE =
  'No Street View override is set — the image above is Google\u2019s default for this location.';
const NO_DEFAULT_MESSAGE =
  'No Street View override is set. Google\u2019s default view will be used.';

function hasOverride(streetview) {
  if (!streetview) return false;
  return Object.values(streetview).some(v => v !== null && v !== undefined);
}

function Row({ label, value, unit }) {
  if (value === null || value === undefined) return null;
  return (
    <tr>
      <th scope="row" style={{ width: '6em', fontWeight: 600, fontSize: '12px', paddingRight: '1em' }}>{label}</th>
      <td style={{ fontSize: '13px' }}>{value}{unit}</td>
    </tr>
  );
}

function LocationStreetviewView({
  value, resourceData, onConfirm, onEdit,
}) {
  const overrideActive = hasOverride(value);
  // A partial override — a heading with no coordinates of its own, say — still applies, on
  // top of the location's coordinates. That is what YourPeer renders, so falling back to a
  // plain default image here would show a different view from the live site.
  const imageUrl = buildImageUrl(resourceData, value);
  const showingDefault = !overrideActive && !!imageUrl;

  return (
    <div className="w-100">
      <div className="mb-3">
        <span className={`badge ${overrideActive ? 'badge-success' : 'badge-secondary'}`}>
          {overrideActive ? 'Override active' : 'Using Google default'}
        </span>
      </div>

      {imageUrl && (
        <div className="mb-3">
          <img
            src={imageUrl}
            loading="lazy"
            alt={showingDefault ? 'Default Street View preview' : 'Street View preview'}
            style={{ maxWidth: '100%', display: 'block' }}
          />
        </div>
      )}

      {overrideActive && value && (
        <table className="table table-sm table-borderless mb-3" style={{ width: 'auto' }}>
          <tbody>
            <Row label="Lat" value={value.lat} />
            <Row label="Lng" value={value.lng} />
            <Row label="Heading" value={value.heading} unit="°" />
            <Row label="Pitch" value={value.pitch} unit="°" />
            <Row label="FOV" value={value.fov} unit="°" />
            {value.pano_id && (
              <tr>
                <th scope="row" style={{ width: '6em', fontWeight: 600, fontSize: '12px', paddingRight: '1em', verticalAlign: 'top' }}>Pano ID</th>
                <td style={{ verticalAlign: 'top', lineHeight: '1' }}><code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{value.pano_id}</code></td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!overrideActive && (
        <p className="text-muted" style={{ fontSize: '13px', marginTop: 4 }}>
          {showingDefault ? DEFAULT_SHOWN_MESSAGE : NO_DEFAULT_MESSAGE}
        </p>
      )}

      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

LocationStreetviewView.propTypes = {
  resourceData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  value: PropTypes.shape({
    pano_id: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number,
    heading: PropTypes.number,
    pitch: PropTypes.number,
    fov: PropTypes.number,
  }),
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default LocationStreetviewView;
