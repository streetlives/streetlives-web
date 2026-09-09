/*
 * A minimal stand-in for the parts of the Google Maps JS API that react-google-maps touches, so
 * that map components can be mounted against the real library instead of being replaced by mocks.
 *
 * The one piece of timing that matters: the real API calls `onAdd`/`draw` asynchronously after
 * `setMap`, and react-google-maps relies on that - its OverlayView constructor calls `setMap`
 * before assigning `this.state`, so an overlay attached synchronously would draw against undefined
 * state. `attachDelay` reproduces that deferral.
 */

const MARKER_SETTERS = [
  'setAnimation',
  'setClickable',
  'setCursor',
  'setDraggable',
  'setIcon',
  'setLabel',
  'setMap',
  'setOpacity',
  'setOptions',
  'setPlace',
  'setPosition',
  'setShape',
  'setTitle',
  'setVisible',
  'setZIndex',
];

export default function createGoogleMapsStub() {
  const attachedOverlays = [];
  const markers = [];
  const listeners = [];

  class LatLng {
    constructor(latitude, longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
    }

    lat() {
      return this.latitude;
    }

    lng() {
      return this.longitude;
    }
  }

  // Stands in for the MapCanvasProjection. A pan changes the pixel position of every overlay
  // without changing its LatLng, which is the whole reason draw() is called on every frame.
  const projection = {
    offset: { x: 0, y: 0 },
    fromLatLngToDivPixel(latLng) {
      return {
        x: Math.round(latLng.lng() * 100) + projection.offset.x,
        y: Math.round(latLng.lat() * 100) + projection.offset.y,
      };
    },
  };

  class OverlayView {
    setMap(map) {
      if (map) {
        this.map = map;
        attachedOverlays.push(this);
        // Deferred, exactly as the real API defers it.
        setTimeout(() => this.attach(), 0);
        return;
      }

      const index = attachedOverlays.indexOf(this);
      if (index !== -1) {
        attachedOverlays.splice(index, 1);
      }

      this.map = null;
      if (this.isAdded) {
        this.isAdded = false;
        this.onRemove();
      }
    }

    attach() {
      if (!this.map || this.isAdded || !this.onAdd) {
        return;
      }

      this.isAdded = true;
      this.onAdd();
      this.draw();
    }

    getPanes() {
      return this.map ? this.map.panes : null;
    }

    // eslint-disable-next-line class-methods-use-this
    getProjection() {
      return projection;
    }
  }

  class Marker {
    constructor(options = {}) {
      this.options = options;
      this.calls = MARKER_SETTERS.reduce(
        (calls, name) => Object.assign(calls, { [name]: [] }),
        {},
      );
      markers.push(this);
    }
  }

  MARKER_SETTERS.forEach((name) => {
    Marker.prototype[name] = function record(value) {
      this.calls[name].push(value);
    };
  });
  Marker.MAX_ZINDEX = 1000000;

  const event = {
    addListener(instance, name, handler) {
      const registration = {
        instance,
        name,
        handler,
        removed: false,
      };
      listeners.push(registration);
      return registration;
    },
    removeListener(registration) {
      // eslint-disable-next-line no-param-reassign
      registration.removed = true;
    },
  };

  const createMap = () => ({
    panes: {
      floatPane: document.createElement('div'),
      mapPane: document.createElement('div'),
      markerLayer: document.createElement('div'),
      overlayLayer: document.createElement('div'),
      overlayMouseTarget: document.createElement('div'),
    },
  });

  const maps = {
    LatLng,
    Marker,
    OverlayView,
    event,
  };

  return {
    google: { maps },
    createMap,
    markers,
    // Every listener ever registered, including ones since removed.
    listeners,
    activeListeners: () => listeners.filter(({ removed }) => !removed),
    // Simulate one frame of a drag: the projection shifts and Google redraws every overlay.
    pan: (dx = 10, dy = 10) => {
      projection.offset = { x: projection.offset.x + dx, y: projection.offset.y + dy };
      attachedOverlays.slice().forEach(overlay => overlay.draw());
    },
    attachedOverlays,
  };
}
