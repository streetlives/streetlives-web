/*
 * Integration coverage for the prop caching in ./LocationMarker.
 *
 * react-google-maps compares props by identity and forwards changes to the imperative Maps API,
 * so caching the icon/position objects is what stops every marker re-applying itself on each
 * re-render. The risk that caching introduces is the mirror image: a marker that *should* update
 * and doesn't. These tests mount the real Marker component and assert on the calls that reach the
 * underlying google.maps.Marker.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { MAP } from 'react-google-maps/lib/constants';
import LocationMarker from './LocationMarker';
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

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const makeLocation = (coordinates = [-73.9857, 40.7484]) => ({
  id: 'loc-1',
  position: { coordinates },
});

let maps;
let map;
let wrapper;
let onClick;

const markerFor = ({ mapLocation = makeLocation(), ...props } = {}) => (
  <LocationMarker id="loc-1" mapLocation={mapLocation} onClick={onClick} {...props} />
);

function renderMarker(props) {
  return mount(<MapProvider map={map}>{markerFor(props)}</MapProvider>);
}

const rerenderWith = props => wrapper.setProps({ children: markerFor(props) });

beforeEach(() => {
  maps = createGoogleMapsStub();
  global.google = maps.google;
  map = maps.createMap();
  onClick = jest.fn();
});

afterEach(() => {
  if (wrapper && wrapper.length) {
    wrapper.unmount();
    wrapper = null;
  }
  delete global.google;
});

it('creates one google marker with the right position and icon', () => {
  wrapper = renderMarker({ color: 'gray' });

  expect(maps.markers).toHaveLength(1);
  const [marker] = maps.markers;
  expect(marker.calls.setPosition).toEqual([{ lat: 40.7484, lng: -73.9857 }]);
  expect(marker.calls.setIcon[0].url).toContain('C0C0C0');
});

it('does not re-apply position, icon or listeners when a re-render changes nothing', () => {
  wrapper = renderMarker();
  const [marker] = maps.markers;

  // A fresh mapLocation object holding the same coordinates, as happens when the page refetches.
  rerenderWith({});
  rerenderWith({});

  expect(marker.calls.setPosition).toHaveLength(1);
  expect(marker.calls.setIcon).toHaveLength(1);
  expect(maps.listeners).toHaveLength(1);
  expect(maps.activeListeners()).toHaveLength(1);
});

it('re-applies the icon when the colour changes', () => {
  wrapper = renderMarker({ color: 'blue' });
  const [marker] = maps.markers;

  rerenderWith({ color: 'gray' });

  expect(marker.calls.setIcon).toHaveLength(2);
  expect(marker.calls.setIcon[1].url).toContain('C0C0C0');
});

it('re-applies the position when the location moves', () => {
  wrapper = renderMarker();
  const [marker] = maps.markers;

  rerenderWith({ mapLocation: makeLocation([-73.9, 40.8]) });

  expect(marker.calls.setPosition).toHaveLength(2);
  expect(marker.calls.setPosition[1]).toEqual({ lat: 40.8, lng: -73.9 });
});

it('re-registers the click listener when the handler changes', () => {
  wrapper = renderMarker();
  const newOnClick = jest.fn();

  rerenderWith({ onClick: newOnClick });

  expect(maps.listeners).toHaveLength(2);
  expect(maps.activeListeners()).toHaveLength(1);
  expect(maps.activeListeners()[0].handler).toBe(newOnClick);
});

it('routes marker clicks to the onClick prop', () => {
  wrapper = renderMarker();

  maps.activeListeners()[0].handler();

  expect(onClick).toHaveBeenCalledTimes(1);
});

it('adds no overlay to the map when there is no location URL', () => {
  wrapper = renderMarker();

  expect(maps.attachedOverlays).toHaveLength(0);
  expect(map.panes.overlayMouseTarget.childNodes).toHaveLength(0);
  expect(maps.markers).toHaveLength(1);
});

it('renders a crawlable anchor into the map when given a location URL', async () => {
  wrapper = renderMarker({ locationUrl: '/find/location/loc-1' });
  await flush();

  const anchor = map.panes.overlayMouseTarget.querySelector('a');
  expect(anchor).not.toBeNull();
  expect(anchor.getAttribute('href')).toBe('/find/location/loc-1');
  expect(maps.markers).toHaveLength(1);
});

it('keeps the marker working across pan frames when wrapped in the overlay', async () => {
  wrapper = renderMarker({ locationUrl: '/find/location/loc-1' });
  await flush();
  const [marker] = maps.markers;

  maps.pan();
  maps.pan();

  expect(maps.markers).toHaveLength(1);
  expect(marker.calls.setPosition).toHaveLength(1);
  expect(map.panes.overlayMouseTarget.querySelectorAll('a')).toHaveLength(1);
});

it('updates the anchor href when the location URL changes', async () => {
  wrapper = renderMarker({ locationUrl: '/find/location/loc-1' });
  await flush();

  rerenderWith({ locationUrl: '/find/Food/location/loc-1' });
  await flush();

  const anchor = map.panes.overlayMouseTarget.querySelector('a');
  expect(anchor.getAttribute('href')).toBe('/find/Food/location/loc-1');
});
