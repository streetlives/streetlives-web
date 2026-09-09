/*
 * Integration coverage for the draw() optimisation in ./OverlayView.
 *
 * Nothing here is mocked out: this mounts the real react-google-maps OverlayView superclass and
 * lets it render its subtree through the real ReactDOM, against a stub of the Google Maps API.
 * The optimisation caches the rendered subtree between draw() calls, so the risk it introduces is
 * a stale or missing subtree - which only shows up if the actual mounted DOM is asserted on.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { MAP } from 'react-google-maps/lib/constants';
import CustomOverlayView from './OverlayView';
import createGoogleMapsStub from './testSupport/googleMapsStub';

class MapProvider extends React.Component {
  getChildContext() {
    return { [MAP]: this.props.map };
  }

  render() {
    return this.props.children;
  }
}

MapProvider.childContextTypes = { [MAP]: PropTypes.object };

// The library defers both the initial attach and its post-update redraw with a timeout, so tests
// have to let the macrotask queue drain before asserting.
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const position = { lat: 40.7484, lng: -73.9857 };

let maps;
let map;
let wrapper;

const pane = () => map.panes.overlayMouseTarget;

const overlayFor = children => (
  <CustomOverlayView position={position} mapPaneName="overlayMouseTarget">
    {children}
  </CustomOverlayView>
);

function renderOverlay(children) {
  return mount(<MapProvider map={map}>{overlayFor(children)}</MapProvider>);
}

beforeEach(() => {
  maps = createGoogleMapsStub();
  global.google = maps.google;
  map = maps.createMap();
});

afterEach(() => {
  if (wrapper && wrapper.length) {
    wrapper.unmount();
    wrapper = null;
  }
  delete global.google;
});

it('mounts its children into the requested map pane', async () => {
  wrapper = renderOverlay(<a href="/find/location/abc">Some location</a>);
  await flush();

  const anchor = pane().querySelector('a');
  expect(anchor).not.toBeNull();
  expect(anchor.getAttribute('href')).toBe('/find/location/abc');
  expect(anchor.textContent).toBe('Some location');
});

it('keeps the mounted children in place across pan frames', async () => {
  wrapper = renderOverlay(<a href="/find/location/abc">Some location</a>);
  await flush();

  maps.pan();
  maps.pan();
  maps.pan();

  expect(pane().querySelectorAll('a')).toHaveLength(1);
  expect(pane().querySelector('a').textContent).toBe('Some location');
});

it('repositions the container on every pan frame', async () => {
  wrapper = renderOverlay(<a href="/find/location/abc">Some location</a>);
  await flush();

  const container = pane().firstChild;
  const before = container.style.left;

  maps.pan(25, 40);

  expect(container.style.left).not.toBe(before);
  expect(container.style.left).toBe(`${Math.round(position.lng * 100) + 25}px`);
  expect(container.style.top).toBe(`${Math.round(position.lat * 100) + 40}px`);
});

it('refreshes the mounted children when props change', async () => {
  wrapper = renderOverlay(<a href="/find/location/abc">Some location</a>);
  await flush();

  wrapper.setProps({
    children: overlayFor(<a href="/find/location/xyz">A different location</a>),
  });
  await flush();

  const anchor = pane().querySelector('a');
  expect(anchor.getAttribute('href')).toBe('/find/location/xyz');
  expect(anchor.textContent).toBe('A different location');
  expect(pane().querySelectorAll('a')).toHaveLength(1);
});

it('still refreshes changed children after the map has been panned', async () => {
  wrapper = renderOverlay(<a href="/find/location/abc">Some location</a>);
  await flush();
  maps.pan();

  wrapper.setProps({
    children: overlayFor(<a href="/find/location/xyz">A different location</a>),
  });
  await flush();
  maps.pan();

  expect(pane().querySelector('a').textContent).toBe('A different location');
});

// The whole point of the change: a pan must not cost a React render per marker per frame. This
// counts real renders of a real child component rather than spying on ReactDOM.
// eslint-disable-next-line react/no-multi-comp
const RenderCounter = ({ onRender, label }) => {
  onRender();
  return <a href="/find/location/abc">{label}</a>;
};

it('does not re-render its children while the map is panned', async () => {
  const onRender = jest.fn();
  wrapper = renderOverlay(<RenderCounter onRender={onRender} label="Some location" />);
  await flush();
  expect(onRender).toHaveBeenCalledTimes(1);

  for (let frame = 0; frame < 60; frame += 1) {
    maps.pan(1, 1);
  }

  // One render for the initial mount, and none for the 60 frames of panning.
  expect(onRender).toHaveBeenCalledTimes(1);
  expect(pane().querySelector('a').textContent).toBe('Some location');
});

it('re-renders its children exactly once per prop change', async () => {
  const onRender = jest.fn();
  wrapper = renderOverlay(<RenderCounter onRender={onRender} label="First" />);
  await flush();

  maps.pan();
  wrapper.setProps({
    children: overlayFor(<RenderCounter onRender={onRender} label="Second" />),
  });
  await flush();
  maps.pan();

  expect(onRender).toHaveBeenCalledTimes(2);
  expect(pane().querySelector('a').textContent).toBe('Second');
});

it('unmounts its children and detaches the container when the overlay unmounts', async () => {
  wrapper = renderOverlay(<a href="/find/location/abc">Some location</a>);
  await flush();
  expect(pane().childNodes).toHaveLength(1);

  wrapper.unmount();
  wrapper = null;

  expect(pane().childNodes).toHaveLength(0);
});

it('restores its children when the overlay is removed from the map and re-added', async () => {
  wrapper = renderOverlay(<a href="/find/location/abc">Some location</a>);
  await flush();

  const [overlay] = maps.attachedOverlays;

  overlay.setMap(null);
  expect(pane().childNodes).toHaveLength(0);

  overlay.setMap(map);
  await flush();

  expect(pane().childNodes).toHaveLength(1);
  expect(pane().querySelector('a').textContent).toBe('Some location');
});
