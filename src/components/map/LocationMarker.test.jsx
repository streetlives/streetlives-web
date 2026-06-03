import React from 'react';
import { shallow } from 'enzyme';
import LocationMarker from './LocationMarker';

jest.mock('react-google-maps', () => ({
  Marker: function Marker({ children }) { return <div>{children}</div>; },
  InfoWindow: function InfoWindow({ children }) { return <div>{children}</div>; },
}));

jest.mock('./OverlayView', () => {
  const OverlayView = ({ children }) => <div>{children}</div>;
  OverlayView.OVERLAY_MOUSE_TARGET = 'overlayMouseTarget';
  return OverlayView;
});

const { Marker } = require('react-google-maps');

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
  const marker = wrapper.find(Marker);
  expect(marker.prop('icon').url).toContain('1400FF');
});

it('uses the gray icon URL when color is gray (closed location)', () => {
  const wrapper = shallow(<LocationMarker {...makeProps({ color: 'gray' })} />);
  const marker = wrapper.find(Marker);
  expect(marker.prop('icon').url).toContain('C0C0C0');
});

it('defaults to blue icon when no color prop is provided', () => {
  const { color: _, ...propsWithoutColor } = makeProps();
  const wrapper = shallow(<LocationMarker {...propsWithoutColor} />);
  const marker = wrapper.find(Marker);
  expect(marker.prop('icon').url).toContain('1400FF');
});
