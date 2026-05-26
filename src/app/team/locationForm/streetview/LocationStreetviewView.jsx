import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';
import config from '../../../../config';

function buildStaticImageUrl(streetview) {
  if (!streetview) return null;
  const {
    pano_id, lat, lng, heading, pitch, fov,
  } = streetview;

  const base = 'https://maps.googleapis.com/maps/api/streetview';
  const common = `size=600x400&key=${config.googleMapApiKey}&fov=${fov || 90}&heading=${heading || 0}&pitch=${pitch || 0}`;

  if (pano_id) {
    return `${base}?${common}&pano=${encodeURIComponent(pano_id)}`;
  }
  if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
    return `${base}?${common}&location=${lat},${lng}`;
  }
  return null;
}

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

function LocationStreetviewView({ value, onConfirm, onEdit }) {
  const imageUrl = buildStaticImageUrl(value);
  const overrideActive = hasOverride(value);

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
            alt="Street View preview"
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
          No Street View override is set. Google&apos;s default view will be used.
        </p>
      )}

      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

LocationStreetviewView.propTypes = {
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
