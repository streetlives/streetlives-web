/* eslint-disable max-len, react/no-multi-comp, camelcase */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withProps } from 'recompose';
import { withScriptjs } from 'react-google-maps';
import config from '../../../../config';
import Header from '../../../../components/header';
import Input from '../../../../components/input';
import Button from '../../../../components/button';

const fovFromZoom = zoom => Math.min(120, Math.max(10, Math.round(180 / (2 ** (zoom || 1)))));

function validate({
  panoId, lat, lng, heading, pitch, fov,
}) {
  const errors = {};
  if (panoId && panoId.length > 128) {
    errors.panoId = 'Must be 128 characters or fewer';
  }
  if (lat !== '') {
    const v = parseFloat(lat);
    if (Number.isNaN(v) || v < -90 || v > 90) errors.lat = 'Must be between -90 and 90';
  }
  if (lng !== '') {
    const v = parseFloat(lng);
    if (Number.isNaN(v) || v < -180 || v > 180) errors.lng = 'Must be between -180 and 180';
  }
  if (heading !== '') {
    const v = parseFloat(heading);
    if (Number.isNaN(v) || v < 0 || v > 360) errors.heading = 'Must be between 0 and 360';
  }
  if (pitch !== '') {
    const v = parseFloat(pitch);
    if (Number.isNaN(v) || v < -90 || v > 90) errors.pitch = 'Must be between -90 and 90';
  }
  if (fov !== '') {
    const v = parseInt(fov, 10);
    if (Number.isNaN(v) || v < 10 || v > 120 || v !== parseFloat(fov)) {
      errors.fov = 'Must be a whole number between 10 and 120';
    }
  }
  return errors;
}

// Extract pano ID from a data.time entry, defensively across API versions.
function getPanoIdFromTimeEntry(t) {
  return t.pano || t.panoid || t.panoId || null;
}

// Extract a Date from a data.time entry. The Maps API uses minified property names
// (e.g. kt, ot) that change across versions, so we scan all own values for a Date.
function getDateFromTimeEntry(t) {
  const isValidDate = d => d instanceof Date && !Number.isNaN(d.getTime());
  const hinted = [t.kt, t.ot, t.date];
  const hintedDate = hinted.find(isValidDate);
  if (hintedDate) return hintedDate;
  const toDate = (v) => {
    if (isValidDate(v)) return v;
    if (typeof v === 'string') {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return null;
  };
  return Object.values(t).map(toDate).find(Boolean) || null;
}

function formatCaptureDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

class PanoramaPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      historicalPanos: [],
      currentPano: props.initialPanoId || null,
      selectedYearPanoId: props.initialPanoId || null,
    };
  }

  componentDidMount() {
    const { initialPanoId, initialPosition } = this.props;
    const opts = { visible: true, pov: { heading: 0, pitch: 0, zoom: 1 }, imageDateControl: true };
    if (initialPanoId) {
      opts.pano = initialPanoId;
    } else if (initialPosition) {
      opts.position = initialPosition;
    }
    // eslint-disable-next-line no-undef
    this.panorama = new window.google.maps.StreetViewPanorama(this.container, opts);

    this.panorama.addListener('pano_changed', this.onPanoChanged);
    // position_changed fires on initial load and when user walks — used to refresh year list.
    // We intentionally do NOT listen to pano_changed for this to avoid triggering a refetch
    // every time setPano() is called from the year picker.
    this.panorama.addListener('position_changed', this.onPositionChanged);

    // Seed the year list immediately if we already have a position.
    if (initialPosition) {
      this.fetchHistoricalPanos(initialPosition);
    }
  }

  componentWillUnmount() {
    this.panorama = null;
  }

  onPanoChanged = () => {
    if (this.panorama) {
      this.setState({ currentPano: this.panorama.getPano() });
    }
  };

  onPositionChanged = () => {
    if (!this.panorama) return;
    const position = this.panorama.getPosition();
    if (position) this.fetchHistoricalPanos(position);
  };

  onSelectYear = (panoId) => {
    if (!this.panorama || !panoId) return;
    this.panorama.setPano(panoId);
    this.setState({ currentPano: panoId, selectedYearPanoId: panoId });
  };

  fetchHistoricalPanos = (position) => {
    if (!position || !window.google) return;
    // Accept both google.maps.LatLng and plain {lat, lng}
    const latLng = (typeof position.lat === 'function')
      ? position
      : new window.google.maps.LatLng(position.lat, position.lng);

    const sv = new window.google.maps.StreetViewService();
    sv.getPanorama({ location: latLng, radius: 50 }, (data, status) => {
      if (status !== window.google.maps.StreetViewStatus.OK || !data || !data.time) {
        this.setState({ historicalPanos: [] });
        return;
      }

      // Log raw shape so we can confirm field names in this API version
      if (data.time.length > 0) {
        // eslint-disable-next-line no-console
        console.log('[StreetView] data.time[0] keys:', Object.keys(data.time[0]), data.time[0]);
      }

      if (data.time.length <= 1) {
        this.setState({ historicalPanos: [], selectedYearPanoId: null });
        return;
      }

      const panos = data.time
        .map((t) => {
          const panoId = getPanoIdFromTimeEntry(t);
          const date = getDateFromTimeEntry(t);
          if (!panoId || !date) {
            // eslint-disable-next-line no-console
            console.warn('[StreetView] Could not parse time entry — unknown shape:', t);
            return null;
          }
          return { panoId, date };
        })
        .filter(Boolean)
        .sort((a, b) => b.date - a.date); // newest first

      // Keep selectedYearPanoId only if it still exists in the new pano list
      // (same physical location). Clear it if the user walked to a different spot.
      const { selectedYearPanoId } = this.state;
      const stillValid = selectedYearPanoId && panos.some(p => p.panoId === selectedYearPanoId);
      this.setState({ historicalPanos: panos, selectedYearPanoId: stillValid ? selectedYearPanoId : null });
    });
  };

  capture = () => {
    if (!this.panorama) return;
    const pov = this.panorama.getPov();
    const position = this.panorama.getPosition();
    this.props.onCapture({
      pano_id: this.state.selectedYearPanoId || null,
      lat: position ? position.lat() : null,
      lng: position ? position.lng() : null,
      heading: pov.heading !== undefined ? pov.heading : null,
      pitch: pov.pitch !== undefined ? pov.pitch : null,
      fov: fovFromZoom(pov.zoom),
    });
  };

  reset = () => {
    if (this.panorama) {
      const { initialPanoId, initialPosition } = this.props;
      if (initialPanoId) {
        this.panorama.setPano(initialPanoId);
      } else if (initialPosition) {
        this.panorama.setPosition(initialPosition);
      }
      this.panorama.setPov({ heading: 0, pitch: 0, zoom: 1 });
    }
    this.setState({ historicalPanos: [], currentPano: null, selectedYearPanoId: null });
    this.props.onReset();
  };

  render() {
    const { historicalPanos, currentPano } = this.state;
    const showYearPicker = historicalPanos.length > 1;

    return (
      <div>
        {showYearPicker && (
          <div style={{ marginBottom: '0.5em', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9em', color: 'var(--darkerGray)', marginRight: '0.75em' }}>
              Capture year:
            </span>
            <select
              value={currentPano || ''}
              onChange={e => this.onSelectYear(e.target.value)}
              style={{
                border: 'none',
                borderBottom: '1px solid var(--borderGray)',
                background: 'transparent',
                padding: '4px 0',
                cursor: 'pointer',
                fontSize: '0.9em',
                color: 'inherit',
              }}
            >
              {historicalPanos.map(({ panoId, date }) => (
                <option key={panoId} value={panoId}>
                  {formatCaptureDate(date)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div ref={(r) => { this.container = r; }} style={{ height: 400, width: '100%' }} />
        <Button primary className="mt-3" onClick={this.capture}>
          Capture current view
        </Button>&nbsp;
        <Button basic primary className="mt-3" onClick={this.reset}>
          Reset to default
        </Button>
      </div>
    );
  }
}

PanoramaPicker.propTypes = {
  initialPanoId: PropTypes.string,
  initialPosition: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onCapture: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

const PanoramaPickerWithScript = compose(
  withProps({
    googleMapURL: config.googleMaps,
    loadingElement: <div style={{ height: 400 }} />,
  }),
  withScriptjs,
)(PanoramaPicker);

function fieldVal(v) {
  return (v !== null && v !== undefined) ? String(v) : '';
}

function FieldError({ message }) {
  if (!message) return null;
  return <div style={{ color: 'red', fontSize: '0.85em', marginTop: 2 }}>{message}</div>;
}

class LocationStreetviewEdit extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      panoId: (value && value.pano_id) ? value.pano_id : '',
      lat: value ? fieldVal(value.lat) : '',
      lng: value ? fieldVal(value.lng) : '',
      heading: value ? fieldVal(value.heading) : '',
      pitch: value ? fieldVal(value.pitch) : '',
      fov: value ? fieldVal(value.fov) : '',
      errors: {},
    };
  }

  onChange = (field, val) => {
    this.setState({ [field]: val, errors: { ...this.state.errors, [field]: undefined } });
  };

  onCapture = ({
    pano_id: capturedPanoId, lat, lng, heading, pitch, fov,
  }) => {
    this.setState({
      panoId: capturedPanoId || '',
      lat: lat !== null ? String(lat) : '',
      lng: lng !== null ? String(lng) : '',
      heading: heading !== null ? String(heading) : '',
      pitch: pitch !== null ? String(pitch) : '',
      fov: fov !== null ? String(fov) : '',
      errors: {},
    });
  };

  onReset = () => {
    this.setState({
      panoId: '',
      lat: '',
      lng: '',
      heading: '',
      pitch: '',
      fov: '',
      errors: {},
    });
  };

  onSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const {
      panoId, lat, lng, heading, pitch, fov,
    } = this.state;
    const errors = validate({
      panoId, lat, lng, heading, pitch, fov,
    });
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }
    const streetviewData = {
      pano_id: panoId || null,
      lat: lat !== '' ? parseFloat(lat) : null,
      lng: lng !== '' ? parseFloat(lng) : null,
      heading: heading !== '' ? parseFloat(heading) : null,
      pitch: pitch !== '' ? parseFloat(pitch) : null,
      fov: fov !== '' ? parseInt(fov, 10) : null,
    };
    this.props.updateValue(streetviewData, this.props.id, this.props.metaDataSection, this.props.fieldName);
    this.props.onSubmit(streetviewData);
  };

  getInitialPanoId() {
    const { value } = this.props;
    return (value && value.pano_id) || null;
  }

  getInitialPosition() {
    const { value, resourceData } = this.props;
    if (value && value.lat !== null && value.lat !== undefined &&
        value.lng !== null && value.lng !== undefined) {
      return { lat: parseFloat(value.lat), lng: parseFloat(value.lng) };
    }
    const coords = resourceData && resourceData.position && resourceData.position.coordinates;
    if (coords) {
      return { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) };
    }
    return null;
  }

  render() {
    const { onCancel } = this.props;
    const {
      panoId, lat, lng, heading, pitch, fov, errors,
    } = this.state;

    return (
      <div>
        <Header>What is the Street View for this location?</Header>

        <PanoramaPickerWithScript
          initialPanoId={this.getInitialPanoId()}
          initialPosition={this.getInitialPosition()}
          onCapture={this.onCapture}
          onReset={this.onReset}
        />

        <div style={{ marginTop: '1.5em' }}>
          <p style={{ fontSize: '0.85em', color: 'var(--darkerGray)' }}>
            You can also paste values directly from a URL.{' '}
            The two numbers after <code>@</code> are the <strong>latitude</strong> and <strong>longitude</strong>;
            the number before <code>y</code> is the <strong>FOV</strong>;
            the number before <code>h</code> is the <strong>heading</strong>;
            the number before <code>t</code> is the <strong>pitch</strong>;
            and the value between <code>!1s</code> and <code>!2e</code> is the <strong>Pano ID</strong>.
          </p>

          <div style={{ marginTop: '1em' }}>
            <label htmlFor="sv-lat">Latitude</label>
            <Input
              id="sv-lat"
              fluid
              type="number"
              value={lat}
              onChange={e => this.onChange('lat', e.target.value)}
              placeholder="-90 to 90"
            />
            <FieldError message={errors.lat} />
          </div>

          <div style={{ marginTop: '1em' }}>
            <label htmlFor="sv-lng">Longitude</label>
            <Input
              id="sv-lng"
              fluid
              type="number"
              value={lng}
              onChange={e => this.onChange('lng', e.target.value)}
              placeholder="-180 to 180"
            />
            <FieldError message={errors.lng} />
          </div>

          <div style={{ marginTop: '1em' }}>
            <label htmlFor="sv-heading">Heading (°)</label>
            <Input
              id="sv-heading"
              fluid
              type="number"
              value={heading}
              onChange={e => this.onChange('heading', e.target.value)}
              placeholder="0–360"
            />
            <FieldError message={errors.heading} />
          </div>

          <div style={{ marginTop: '1em' }}>
            <label htmlFor="sv-pitch">Pitch (°)</label>
            <Input
              id="sv-pitch"
              fluid
              type="number"
              value={pitch}
              onChange={e => this.onChange('pitch', e.target.value)}
              placeholder="-90–90"
            />
            <FieldError message={errors.pitch} />
          </div>

          <div style={{ marginTop: '1em' }}>
            <label htmlFor="sv-fov">FOV (°)</label>
            <Input
              id="sv-fov"
              fluid
              type="number"
              value={fov}
              onChange={e => this.onChange('fov', e.target.value)}
              placeholder="10–120"
            />
            <FieldError message={errors.fov} />
          </div>

          <div style={{ marginTop: '1em' }}>
            <label htmlFor="sv-pano-id">Pano ID</label>
            <Input
              id="sv-pano-id"
              fluid
              value={panoId}
              onChange={e => this.onChange('panoId', e.target.value)}
              placeholder="e.g. CAoSLEFBIFBJWFdBQ…"
            />
            <div style={{ fontSize: '0.8em', color: 'var(--darkerGray)', marginTop: 2 }}>
              Only include this when pinning a historical image (use the year picker above).
            </div>
            <FieldError message={errors.panoId} />
          </div>

        </div>

        <Button primary className="mt-3" onClick={this.onSubmit}>
          OK
        </Button>&nbsp;
        <Button basic primary className="mt-3" onClick={onCancel}>
          CANCEL
        </Button>
      </div>
    );
  }
}

LocationStreetviewEdit.propTypes = {
  value: PropTypes.shape({
    pano_id: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number,
    heading: PropTypes.number,
    pitch: PropTypes.number,
    fov: PropTypes.number,
  }),
  resourceData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updateValue: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  metaDataSection: PropTypes.string,
  fieldName: PropTypes.string,
  id: PropTypes.string,
};

export default LocationStreetviewEdit;
