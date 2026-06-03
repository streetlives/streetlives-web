import React from 'react';
import { shallow } from 'enzyme';
import LocationMarker from './LocationMarker';

jest.mock('react-google-maps', () => {
  // eslint-disable-next-line global-require
  const R = require('react');
  return {
    Marker: function Marker({ children }) {
      return R.createElement('div', null, children);
    },
    InfoWindow: function InfoWindow({ children }) {
      return R.createElement('div', null, children);
    },
  };
});

jest.mock('./OverlayView', () => {
  // eslint-disable-next-line global-require
  const R = require('react');
  const OverlayView = function OverlayView({ children }) {
    return R.createElement('div', null, children);
  };
  OverlayView.OVERLAY_MOUSE_TARGET = 'overlayMouseTarget';
  return OverlayView;
});

const { Marker } = require('react-google-maps'); // eslint-disable-line global-require

const makeProps = (overrides = {}) => ({
  id: 'loc-1',
  mapLocation: {
    id: 'loc-1',
    position: { coordinates: [-73.9857, 40.7484] },
  },
  isOpen: false,
  onClick: jest.fn(),
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  ...overrides,
});

it('renders without crashing', () => {
  const wrapper = shallow(<LocationMarker {...makeProps()} />);
  expect(wrapper).toHaveLength(1);
});

it('uses the blue icon URL when color is blue', () => {
  const wrapper = shallow(<LocationMarker {...makeProps({ color: 'blue' })} />);
  expect(wrapper.find(Marker).prop('icon').url).toContain('1400FF');
});

it('uses the gray icon URL when color is gray (closed location)', () => {
  const wrapper = shallow(<LocationMarker {...makeProps({ color: 'gray' })} />);
  expect(wrapper.find(Marker).prop('icon').url).toContain('C0C0C0');
});

it('defaults to blue icon when no color prop is provided', () => {
  const props = makeProps();
  delete props.color;
  const wrapper = shallow(<LocationMarker {...props} />);
  expect(wrapper.find(Marker).prop('icon').url).toContain('1400FF');
});
