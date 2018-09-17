import React from 'react';
import { shallow } from 'enzyme';
import Heart from './Heart';

it('renders without crashing', () => {
  const wrapper = shallow(<Heart />);
  expect(wrapper).toHaveLength(1);
});
