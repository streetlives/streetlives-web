import React from "react";
import { shallow } from "enzyme";
import Button from "./Button";

it("renders without crashing", () => {
  const wrapper = shallow(<Button />);
  expect(wrapper).toHaveLength(1);
});
