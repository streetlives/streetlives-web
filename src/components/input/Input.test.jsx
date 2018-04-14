import React from 'react';
import { shallow } from 'enzyme';
import Input from './Input';

it('renders without crashing', () => {
  const wrapper = shallow(<Input />);
  expect(wrapper).toHaveLength(1);
});
