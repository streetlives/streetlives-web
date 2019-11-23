import React from 'react';
import { shallow } from 'enzyme';
import MapView from './MapView';

it('renders without crashing', () => {
  const wrapper = shallow(<MapView />);
  expect(wrapper).toHaveLength(1);
});
