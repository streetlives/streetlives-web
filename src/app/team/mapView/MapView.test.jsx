import React from 'react';
import { shallow } from 'enzyme';
import MapView from './MapView';
import ExistingLocationMarker from './ExistingLocationMarker';

jest.mock('../../../components/map', () => function Map() { return null; });
jest.mock('../../../components/dropdown', () => function Dropdown() { return null; });
jest.mock('../../../components/icon', () => function Icon() { return null; });
jest.mock('./ExistingLocationMarker', () => function ExistingLocationMarker() { return null; });
jest.mock('./NewLocationMarker', () => function NewLocationMarker() { return null; });
jest.mock('../../../services/api', () => ({ getLocations: jest.fn() }));
jest.mock('../../../services/geocoding', () => ({ getAddressForLocation: jest.fn() }));

const makeLocation = (overrides = {}) => ({
  id: 'loc-1',
  closed: false,
  Services: [],
  services: [],
  position: { coordinates: [-73.9857, 40.7484] },
  Organization: { name: 'Test Org' },
  PhysicalAddresses: [],
  Phones: [],
  ...overrides,
});

it('renders without crashing', () => {
  const wrapper = shallow(<MapView />, { disableLifecycleMethods: true });
  expect(wrapper).toHaveLength(1);
});

function colorForLocation(location) {
  const wrapper = shallow(<MapView />, { disableLifecycleMethods: true });
  wrapper.setState({ locations: [location] });
  return wrapper.find(ExistingLocationMarker).prop('color');
}

it('passes color="gray" for a closed location that has services', () => {
  expect(colorForLocation(makeLocation({ closed: true, Services: [{ id: 'svc-1' }] }))).toBe('gray');
});

it('passes color="gray" for a closed location with no services', () => {
  expect(colorForLocation(makeLocation({ closed: true }))).toBe('gray');
});

it('passes color="blue" for an open location with services', () => {
  expect(colorForLocation(makeLocation({ Services: [{ id: 'svc-1' }] }))).toBe('blue');
});

it('passes color="red" for an open location with no services', () => {
  expect(colorForLocation(makeLocation())).toBe('red');
});
