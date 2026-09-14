/* eslint-disable max-len, react/no-multi-comp, camelcase */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withProps } from 'recompose';
import { withScriptjs } from 'react-google-maps';
import config from '../../../../config';
import Header from '../../../../components/header';
import Input from '../../../../components/input';
import Button from '../../../../components/button';
import {
  parseStreetviewUrl, isShortStreetviewLink, fovFromZoom, zoomFromFov,
} from './utils';

function validate({
  panoId, lat, lng, heading, pitch, fov,
}) {
  const errors = {};
  if (panoId && panoId.trim().length > 128) {
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

  // Cross-field: lat and lng must be provided together
  if (lat !== '' && !errors.lat && lng === '') {
    errors.lng = 'Required when latitude is provided';
  }
  if (lng !== '' && !errors.lng && lat === '') {
    errors.lat = 'Required when longitude is provided';
  }

  // Cross-field: any field data requires a valid Street View anchor (panoId or lat+lng)
  const hasPanoId = !!(panoId && panoId.trim() && !errors.panoId);
  const hasValidCoords = lat !== '' && !errors.lat && lng !== '' && !errors.lng;
  const hasValidAnchor = hasPanoId || hasValidCoords;
  const hasAnyData = !!(panoId && panoId.trim()) || lat !== '' || lng !== '' || heading !== '' || pitch !== '' || fov !== '';
  if (hasAnyData && !hasValidAnchor && !errors.lat && !errors.lng) {
    errors._form = 'A Pano ID or both latitude and longitude are required to save a Street View override';
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

// The panorama fires pov and position events continuously while the view is being
// dragged. The fields only need the view it settles on.
const CAPTURE_DEBOUNCE_MS = 250;

// What counts as the specialist handling the panorama. Bound natively in the capture
// phase on the container, because the Maps API stops some of these on the way up and
// React's delegated listeners would never see them.
const INTERACTION_EVENTS = ['mousedown', 'touchstart', 'wheel', 'keydown'];

// Releasing a drag means the view is where the specialist wants it. Capturing there and
// then, rather than a debounce later, is what lets someone let go and press OK straight
// away without losing the adjustment they just made.
const SETTLE_EVENTS = ['mouseup', 'touchend'];

// How long to wait for a new image to report where it is before giving up on it. A
// panorama that has gone quiet must not leave the form unable to save for good.
const PANO_SWITCH_TIMEOUT_MS = 4000;

function formatCaptureDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

class PanoramaPicker extends Component {
  constructor(props) {
    super(props);
    // The image whose position we have actually seen. The panorama answers to a new id
    // before it reports where that image is, so this is what says its two halves agree —
    // and it is the one thing a capture may not do without.
    this.settledPano = props.initialPanoId || null;
    this.state = {
      historicalPanos: [],
      currentPano: props.initialPanoId || null,
    };
  }

  componentDidMount() {
    const { initialPanoId, initialPosition } = this.props;
    // zoom is a panorama option in its own right; StreetViewPov carries only heading/pitch.
    const opts = {
      visible: true, pov: { heading: 0, pitch: 0 }, zoom: 1, imageDateControl: true,
    };
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
    // The fields follow the view rather than waiting for a button, so every way the
    // panorama can move has to feed a capture. Turning and zooming change nothing the two
    // listeners above would notice.
    this.panorama.addListener('pov_changed', this.scheduleCapture);
    this.panorama.addListener('zoom_changed', this.scheduleCapture);

    INTERACTION_EVENTS.forEach(name =>
      this.container.addEventListener(name, this.startCapturing, true));
    SETTLE_EVENTS.forEach(name =>
      this.container.addEventListener(name, this.flushCapture, true));
    this.props.captureHandle.flush = this.flushCapture;
    this.props.captureHandle.stop = this.stopCapturing;
    this.props.captureHandle.switching = this.isSwitching;

    // Seed the year list immediately if we already have a position.
    if (initialPosition) {
      this.fetchHistoricalPanos(initialPosition);
    }

    // A URL pasted while the Maps script was still loading leaves a target waiting that
    // componentDidUpdate would never see, because this mount is its first render.
    if (this.props.targetKey) this.applyTarget();
  }

  componentDidUpdate() {
    if (this.props.targetKey !== this.appliedTargetKey) this.applyTarget();
  }

  componentWillUnmount() {
    clearTimeout(this.captureTimer);
    this.captureTimer = null;
    clearTimeout(this.panoSwitchTimer);
    this.panoSwitchTimer = null;
    this.capturing = false;
    if (this.props.captureHandle.flush === this.flushCapture) {
      this.props.captureHandle.flush = null;
      this.props.captureHandle.stop = null;
      this.props.captureHandle.switching = null;
    }
    if (this.container) {
      INTERACTION_EVENTS.forEach(name =>
        this.container.removeEventListener(name, this.startCapturing, true));
      SETTLE_EVENTS.forEach(name =>
        this.container.removeEventListener(name, this.flushCapture, true));
    }
    this.panorama = null;
  }

  onPanoChanged = () => {
    if (!this.panorama) return;
    const pano = this.panorama.getPano();
    // Walking off the image the specialist picked retires their choice with it.
    if (this.pinnedByUser !== pano) this.pinnedByUser = null;
    // The id changes before the position does, so this is only half the news — for a
    // picked year and for an ordinary walk alike. Until the position lands, the panorama
    // describes one image by id and another by coordinates, and the year list still
    // belongs to where we were. Nothing may be read from it in between. The two can also
    // arrive the other way round, and a position already seen needs no waiting for.
    if (this.panoSwitchPending === pano) {
      this.pendingPanoArrived = true;
    } else if (this.settledPano !== pano) {
      this.beginPanoSwitch(pano, true);
    }
    this.setState({ currentPano: pano });
    this.scheduleCapture();
  };

  onPositionChanged = () => {
    if (!this.panorama) return;
    const pano = this.panorama.getPano();
    // A position settles the image it belongs to and no other, and the panorama answers
    // to a requested id straight away, so a position owed by an abandoned image would
    // read as the current one's. Spend those first: the count is what tells them apart.
    if (this.stalePositionsOwed > 0) {
      this.stalePositionsOwed -= 1;
      return;
    }
    // Whatever else arrives has to be about the image being waited for. Nothing is owed
    // at this point, so a position for the pending image settles it whether or not it has
    // announced itself — the two halves can arrive in either order.
    if (this.panoSwitchPending && this.panoSwitchPending !== pano) return;
    // The position is the last thing to arrive, so this is where a transition is really
    // over and the panorama can be read as one consistent view again.
    this.settledPano = pano;
    this.endPanoSwitch();
    const position = this.panorama.getPosition();
    if (position) this.fetchHistoricalPanos(position);
    this.scheduleCapture();
  };

  onSelectYear = (panoId) => {
    if (!this.panorama || !panoId) return;
    const { historicalPanos } = this.state;
    // Picking a year is the specialist choosing an image, so it counts as handling the
    // panorama even though the pointer never entered it.
    this.startCapturing();
    // Picking the newest year is a decision to pin nothing, so that is what gets
    // remembered. Holding the pano here instead would let a capture made against a list
    // that has not arrived yet put the pin back and freeze the override on today's image.
    const [latest] = historicalPanos;
    this.pinnedByUser = (latest && panoId === latest.panoId) ? null : panoId;
    // setPano only starts the switch, and the fields are never written from a guess about
    // how it will end: they carry a capture of a settled panorama or nothing at all. The
    // form refuses to save while the switch is in flight, so the choice cannot be lost by
    // saving early either. This only moves the dropdown onto the year that was picked.
    this.beginPanoSwitch(panoId);
    this.panorama.setPano(panoId);
    this.setState({ currentPano: panoId });
  };

  // A pano ID is only needed to pin an older image. When the newest capture is on screen,
  // saving its pano would freeze the override on today's imagery — lat/lng + POV keeps it
  // following whatever Google publishes next. Unknown pano list is treated as "latest".
  getPanoIdToPin = () => {
    const { historicalPanos, currentPano } = this.state;
    if (!currentPano) return null;

    // The list has to be the one for where the panorama is now. Walking asks for a new
    // one, and until it lands the list we hold describes a spot we have left.
    const listIsCurrent = this.panoListId === this.panoRequestId;
    if (listIsCurrent && historicalPanos.length > 0) {
      const [latest] = historicalPanos; // sorted newest first
      return currentPano === latest.panoId ? null : currentPano;
    }

    // Without a list to decide against, a year the specialist picked is still their
    // decision and holds. Anything else saves no pin: judging against the wrong list can
    // pin what is actually the newest image here, which is the one thing a pin must never
    // do. The list arriving schedules another capture that settles it properly.
    return this.pinnedByUser === currentPano ? currentPano : null;
  };

  // Re-points the panorama at a pasted URL. The parent bumps targetKey on every successful
  // paste rather than us diffing target, so pasting the same URL twice still brings the
  // view back after the user has walked away from it. Recording what was last applied on
  // the instance, rather than comparing prevProps, is what makes this work in both mount
  // orders.
  applyTarget = () => {
    const { target, targetKey } = this.props;
    this.appliedTargetKey = targetKey;
    if (!this.panorama || !target) return;
    // The link replaces whatever was picked before it, including a year switch still on
    // its way — and a link carrying only coordinates never fires pano_changed to say so.
    this.endPanoSwitch();
    this.pinnedByUser = null;

    // Exclusive, mirroring componentDidMount's pano-over-position precedence. Setting a
    // position after a pano would snap off the pinned image onto the nearest current one.
    if (target.panoId) {
      this.panorama.setPano(target.panoId);
      this.setState({ currentPano: target.panoId });
    } else if (target.position) {
      this.panorama.setPosition(target.position);
    }

    // Last, because setPano/setPosition can reset the point of view.
    this.panorama.setPov({
      heading: target.heading !== null ? target.heading : 0,
      pitch: target.pitch !== null ? target.pitch : 0,
    });
    this.panorama.setZoom(zoomFromFov(target.fov));
  };

  fetchHistoricalPanos = (position) => {
    if (!position || !window.google) return;
    // Walking fires one of these per step and the responses can land out of order. An
    // earlier spot's year list would both replace the right one and, because the pin
    // decision reads it, pin the wrong image for where the panorama actually is.
    this.panoRequestId = (this.panoRequestId || 0) + 1;
    const requestId = this.panoRequestId;
    // Accept both google.maps.LatLng and plain {lat, lng}
    const latLng = (typeof position.lat === 'function')
      ? position
      : new window.google.maps.LatLng(position.lat, position.lng);

    const sv = new window.google.maps.StreetViewService();
    sv.getPanorama({ location: latLng, radius: 50 }, (data, status) => {
      if (requestId !== this.panoRequestId || !this.panorama) return;
      // A single capture date means there is nothing to choose between, so no picker.
      if (status !== window.google.maps.StreetViewStatus.OK || !data || !data.time ||
          data.time.length <= 1) {
        // The pin decision reads this list, so a capture waiting on a walk to a new spot
        // has to be redone against the list that belongs to it.
        this.panoListId = requestId;
        this.setState({ historicalPanos: [] }, this.scheduleCapture);
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

      this.panoListId = requestId;
      this.setState({ historicalPanos: panos }, this.scheduleCapture);
    });
  };

  // Nothing is captured until the specialist actually handles the panorama. Google moves
  // it on its own — on load, and while it settles after a reset — and capturing those
  // would write an override nobody asked for over fields that are meant to stay empty.
  startCapturing = () => {
    this.capturing = true;
  };

  // Typing in a field, or pasting a URL, is the specialist taking the fields over by
  // hand. A capture still to come — a late year list schedules one — would otherwise
  // overwrite what they just typed. Handling the panorama again arms it back up.
  stopCapturing = () => {
    this.capturing = false;
    clearTimeout(this.captureTimer);
    this.captureTimer = null;
  };

  scheduleCapture = () => {
    if (!this.capturing) return;
    clearTimeout(this.captureTimer);
    this.captureTimer = setTimeout(this.capture, CAPTURE_DEBOUNCE_MS);
  };

  // `arrived` says whether the image has already announced itself, leaving only its
  // position outstanding — true when the transition is noticed from pano_changed, false
  // when a picked year starts one before the panorama has said anything at all.
  beginPanoSwitch = (panoId, arrived = false) => {
    // An image that announced itself and was then replaced still owes a position, and it
    // will arrive reading as though it belonged to whatever is current by then. That one
    // is spoken for; it is counted here so it can be spent rather than believed.
    if (this.panoSwitchPending && this.pendingPanoArrived && this.panoSwitchPending !== panoId) {
      this.stalePositionsOwed = (this.stalePositionsOwed || 0) + 1;
    }
    this.panoSwitchPending = panoId;
    this.pendingPanoArrived = arrived;
    clearTimeout(this.panoSwitchTimer);
    this.panoSwitchTimer = setTimeout(this.onPanoSwitchTimedOut, PANO_SWITCH_TIMEOUT_MS);
  };

  // The position never came, so there is no view here to read: the id belongs to one
  // image and the coordinates may belong to another, and nothing on offer says which.
  // A matching id is not proof — the position can simply be late. So the transition is
  // written off: nothing is captured, the dropdown goes back to whatever the panorama
  // actually reports, and the fields keep describing the last image that did settle.
  // Saving is allowed again, because a panorama gone quiet must not lock the form.
  onPanoSwitchTimedOut = () => {
    // Only the waiting stops here. The panorama stays unreadable — settledPano still
    // names the last image that reported a position — so no capture can take the halves
    // of two images for one view. Which leaves the screen showing one image while the
    // fields describe another, so the form says so rather than let it pass unremarked.
    this.endPanoSwitch();
    this.pinnedByUser = null;
    if (this.panorama) this.setState({ currentPano: this.panorama.getPano() });
    this.props.onSwitchAbandoned();
  };

  endPanoSwitch = () => {
    clearTimeout(this.panoSwitchTimer);
    this.panoSwitchTimer = null;
    this.panoSwitchPending = null;
    this.pendingPanoArrived = false;
  };

  isSwitching = () => !!this.panoSwitchPending;

  // Takes a waiting capture now and hands back what it read. The form submits on the
  // fields, and setState inside an event handler does not land before the handler
  // finishes, so pressing OK on a view adjusted a moment ago has to read the view here
  // rather than wait for the debounce that is still pending. A capture is only waiting
  // when something actually moved, so a click that changed nothing captures nothing.
  flushCapture = () => {
    if (!this.captureTimer) return null;
    return this.capture();
  };

  capture = () => {
    clearTimeout(this.captureTimer);
    this.captureTimer = null;
    if (!this.panorama) return null;
    // The id and the coordinates have to belong to the same image. Between a pano
    // arriving and its position arriving they do not, and a transition written off for
    // taking too long is no more readable for having stopped being waited on — it stays
    // unreadable until the position it never sent finally lands.
    if (this.state.currentPano !== this.settledPano) return null;
    const pov = this.panorama.getPov();
    const position = this.panorama.getPosition();
    const view = {
      pano_id: this.getPanoIdToPin(),
      lat: position ? position.lat() : null,
      lng: position ? position.lng() : null,
      heading: pov.heading !== undefined ? pov.heading : null,
      pitch: pov.pitch !== undefined ? pov.pitch : null,
      // getPov() carries no zoom — reading it there silently pinned every capture at 90.
      fov: fovFromZoom(this.panorama.getZoom()),
    };
    this.props.onCapture(view);
    return view;
  };

  reset = () => {
    // The panorama keeps firing move events while it settles onto the default position;
    // each one would otherwise refill the fields this reset is clearing.
    this.stopCapturing();
    this.pinnedByUser = null;
    this.endPanoSwitch();
    if (this.panorama) {
      // Back to the location's own coordinates and the latest imagery there — not to the
      // saved override, which is exactly what "reset to default" is meant to undo.
      const { defaultPosition } = this.props;
      if (defaultPosition) {
        this.panorama.setPosition(defaultPosition);
      }
      this.panorama.setPov({ heading: 0, pitch: 0 });
      this.panorama.setZoom(1);
    }
    // The year list goes, but not the panorama's identity: the view may already be at the
    // default position, in which case setPosition moves nothing and no event arrives to
    // put back what null erased. The two names for the image on screen have to keep
    // agreeing, or nothing the specialist does to the view can be read again.
    this.setState({
      historicalPanos: [],
      currentPano: this.panorama ? this.panorama.getPano() : null,
    });
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
        <div
          ref={(r) => { this.container = r; }}
          data-testid="streetview-panorama"
          style={{ height: 400, width: '100%' }}
        />
        <div style={{ fontSize: '0.8em', color: 'var(--darkerGray)', marginTop: '0.5em' }}>
          Move the view above and the fields below follow it.
        </div>
        <Button basic primary className="mt-3" onClick={this.reset}>
          Reset to default
        </Button>
      </div>
    );
  }
}

const positionShape = PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number });

// The fields a pasted URL normally fills in for you, kept out of the way by default.
const ADVANCED_FIELDS = ['heading', 'pitch', 'fov', 'panoId'];

const NO_STREETVIEW_ERROR = 'Couldn\u2019t find a Street View in that link. Open the view in ' +
  'Google Maps, then copy the URL from your browser\u2019s address bar.';

const SHORT_LINK_ERROR = 'Short share links can\u2019t be read. Open the link in your browser, ' +
  'then copy the full URL from the address bar.';

const SWITCHING_ERROR = 'The Street View image you picked is still loading. Try again in a moment.';

const SWITCH_ABANDONED_NOTICE = 'That Street View image never finished loading, so the fields ' +
  'below still describe the view before it \u2014 that is what saving would store. Pick the ' +
  'year again, or move the panorama, to use a different image.';

PanoramaPicker.propTypes = {
  initialPanoId: PropTypes.string,
  initialPosition: positionShape,
  defaultPosition: positionShape,
  // Where a pasted URL wants the panorama pointed, applied whenever targetKey changes.
  target: PropTypes.shape({
    panoId: PropTypes.string,
    position: positionShape,
    heading: PropTypes.number,
    pitch: PropTypes.number,
    fov: PropTypes.number,
  }),
  targetKey: PropTypes.number,
  onCapture: PropTypes.func.isRequired,
  onSwitchAbandoned: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  // Mutable handle the form submits through — see flushCapture.
  captureHandle: PropTypes.shape({
    flush: PropTypes.func,
    stop: PropTypes.func,
    switching: PropTypes.func,
  }).isRequired,
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

function fieldsFromView({
  pano_id: panoId, lat, lng, heading, pitch, fov,
}) {
  return {
    panoId: panoId || '',
    lat: fieldVal(lat),
    lng: fieldVal(lng),
    heading: fieldVal(heading),
    pitch: fieldVal(pitch),
    fov: fieldVal(fov),
  };
}

function FieldError({ message }) {
  if (!message) return null;
  return <div style={{ color: 'red', fontSize: '0.85em', marginTop: 2 }}>{message}</div>;
}

class LocationStreetviewEdit extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    // Filled in by the picker once it mounts; the form submits through it so a capture
    // still waiting on the debounce is taken before the fields are read.
    this.captureHandle = {};
    this.state = {
      panoId: (value && value.pano_id) ? value.pano_id : '',
      lat: value ? fieldVal(value.lat) : '',
      lng: value ? fieldVal(value.lng) : '',
      heading: value ? fieldVal(value.heading) : '',
      pitch: value ? fieldVal(value.pitch) : '',
      fov: value ? fieldVal(value.fov) : '',
      url: '',
      urlError: null,
      // Where a successful paste wants the panorama pointed, plus a counter the picker
      // watches so re-pasting the same URL re-applies it.
      target: null,
      targetKey: 0,
      // Start expanded when an existing override pins a historical image, so nobody edits
      // a location without seeing the pano ID doing the pinning. Heading/pitch/fov are set
      // on practically every saved record, so keying off those would expand it always.
      showAdvanced: !!(value && value.pano_id),
      errors: {},
    };
  }

  onChange = (field, val) => {
    if (this.captureHandle.stop) this.captureHandle.stop();
    this.setState({ [field]: val, errors: { ...this.state.errors, [field]: undefined } });
  };

  // A paste replaces all six fields rather than merging. Letting a stale heading or pano
  // ID from an earlier URL ride along with new coordinates is the exact class of mismatch
  // this field exists to prevent.
  onUrlChange = (url) => {
    // The pasted URL is the six fields now; a capture left over from an earlier drag
    // would land on top of it.
    if (this.captureHandle.stop) this.captureHandle.stop();
    const parsed = parseStreetviewUrl(url);
    if (!parsed) {
      // Deliberately no error yet — someone typing or correcting a URL by hand would see
      // one on almost every keystroke. onUrlBlur reports it once they are done.
      this.setState({ url, urlError: null });
      return;
    }

    const hasCoords = parsed.lat !== null && parsed.lng !== null;
    this.setState(prevState => ({
      url,
      urlError: null,
      panoId: parsed.pano_id || '',
      lat: fieldVal(parsed.lat),
      lng: fieldVal(parsed.lng),
      heading: fieldVal(parsed.heading),
      pitch: fieldVal(parsed.pitch),
      fov: fieldVal(parsed.fov),
      errors: {},
      target: {
        panoId: parsed.pano_id,
        position: hasCoords ? { lat: parsed.lat, lng: parsed.lng } : null,
        heading: parsed.heading,
        pitch: parsed.pitch,
        fov: parsed.fov,
      },
      targetKey: prevState.targetKey + 1,
    }));
  };

  onUrlBlur = () => {
    const { url } = this.state;
    if (!url.trim() || parseStreetviewUrl(url)) return;
    this.setState({
      urlError: isShortStreetviewLink(url) ? SHORT_LINK_ERROR : NO_STREETVIEW_ERROR,
    });
  };

  onCapture = (view) => {
    this.setState({ ...fieldsFromView(view), errors: {} });
  };

  // The panorama gave up on an image it never managed to load. The fields still hold the
  // view before it, which is no longer what is on screen — say so, rather than let OK
  // store one image while the specialist is looking at another. A capture clears this,
  // which is exactly when the two agree again.
  onSwitchAbandoned = () => {
    this.setState(prevState => ({
      errors: { ...prevState.errors, _form: SWITCH_ABANDONED_NOTICE },
    }));
  };

  onReset = () => {
    this.setState({
      panoId: '',
      lat: '',
      lng: '',
      heading: '',
      pitch: '',
      fov: '',
      url: '',
      urlError: null,
      errors: {},
    });
  };

  onSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    // Mid-switch the panorama still reports the image on its way out, so there is no
    // honest view to save: the coordinates would be the outgoing image's while the pin
    // belongs to the incoming one. It clears itself — the switch lands within moments and
    // the capture it triggers wipes this error along with the stale fields.
    if (this.captureHandle.switching && this.captureHandle.switching()) {
      this.setState({ errors: { _form: SWITCHING_ERROR } });
      return;
    }
    // A view adjusted and OK'd inside the same quarter-second would otherwise be saved as
    // the fields stood before it: the capture is still pending, and the setState it will
    // make could not have landed in this handler anyway.
    const pending = this.captureHandle.flush && this.captureHandle.flush();
    const {
      panoId, lat, lng, heading, pitch, fov,
    } = pending ? fieldsFromView(pending) : this.state;
    const errors = validate({
      panoId, lat, lng, heading, pitch, fov,
    });
    if (Object.keys(errors).length > 0) {
      // An error on a collapsed field would otherwise refuse the save with nothing on
      // screen to explain why. One-way, so submitting never collapses what the user opened.
      const hasHiddenError = ADVANCED_FIELDS.some(key => errors[key]);
      this.setState(prevState => ({
        errors,
        showAdvanced: prevState.showAdvanced || hasHiddenError,
      }));
      return;
    }
    const streetviewData = {
      pano_id: panoId.trim() || null,
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

  getDefaultPosition() {
    const { resourceData } = this.props;
    const coords = resourceData && resourceData.position && resourceData.position.coordinates;
    return coords ? { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) } : null;
  }

  getInitialPosition() {
    const { value } = this.props;
    if (value && value.lat !== null && value.lat !== undefined &&
        value.lng !== null && value.lng !== undefined) {
      return { lat: parseFloat(value.lat), lng: parseFloat(value.lng) };
    }
    return this.getDefaultPosition();
  }

  toggleAdvanced = () => {
    this.setState(prevState => ({ showAdvanced: !prevState.showAdvanced }));
  };

  render() {
    const { onCancel } = this.props;
    const {
      panoId, lat, lng, heading, pitch, fov, errors, url, urlError, showAdvanced,
      target, targetKey,
    } = this.state;

    return (
      <div>
        <Header>What is the Street View for this location?</Header>

        <div style={{ marginBottom: '1.5em' }}>
          <label htmlFor="sv-url">Street View URL</label>
          <Input
            id="sv-url"
            fluid
            value={url}
            onChange={e => this.onUrlChange(e.target.value)}
            onBlur={this.onUrlBlur}
            placeholder="Paste a Google Maps Street View link"
          />
          <div style={{ fontSize: '0.8em', color: 'var(--darkerGray)', marginTop: 2 }}>
            Paste a link and the fields below fill in for you. You can then fine-tune the
            view in the panorama.
          </div>
          <FieldError message={urlError} />
        </div>

        <PanoramaPickerWithScript
          initialPanoId={this.getInitialPanoId()}
          initialPosition={this.getInitialPosition()}
          defaultPosition={this.getDefaultPosition()}
          target={target}
          targetKey={targetKey}
          captureHandle={this.captureHandle}
          onCapture={this.onCapture}
          onSwitchAbandoned={this.onSwitchAbandoned}
          onReset={this.onReset}
        />

        <div style={{ marginTop: '1.5em' }}>
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

          <Button
            basic
            primary
            compact
            className="mt-3"
            onClick={this.toggleAdvanced}
          >
            {showAdvanced ? 'Hide advanced fields' : 'Show advanced fields'}
          </Button>

          {showAdvanced && (
          <div>
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
          )}

        </div>

        <FieldError message={errors._form} />

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
