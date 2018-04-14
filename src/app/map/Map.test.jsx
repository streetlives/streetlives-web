import React from 'react';
import { shallow } from 'enzyme';
import Map from './Map';

it('renders without crashing', () => {
  const wrapper = shallow(<Map />);
  expect(wrapper).toHaveLength(1);
});
