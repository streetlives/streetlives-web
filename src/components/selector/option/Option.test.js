import React from "react";
import { shallow } from "enzyme";
import Option from "./Option";

it("renders without crashing", () => {
  const wrapper = shallow(<Option />);
  expect(wrapper).toHaveLength(1);
});
