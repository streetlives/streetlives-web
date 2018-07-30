import React from 'react';
import { shallow } from 'enzyme';
import TextArea from './TextArea';

it('renders without crashing', () => {
  const wrapper = shallow(<TextArea />);
  expect(wrapper).toHaveLength(1);
});
