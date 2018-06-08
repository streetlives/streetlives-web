import React from 'react';
import { shallow } from 'enzyme';
import Dropdown from './Dropdown';

it('renders without crashing', () => {
  const wrapper = shallow(<Dropdown />);
  expect(wrapper).toHaveLength(1);
});
