import React from "react";
import { shallow } from "enzyme";
import Selector from "./Selector";

it("renders without crashing", () => {
  const wrapper = shallow(<Selector />);
  expect(wrapper).toHaveLength(1);
});
