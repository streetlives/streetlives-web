import React from "react";
import Map from "./Map";
import { shallow } from "enzyme";

it("renders without crashing", () => {
  const wrapper = shallow(<Map />);
  expect(wrapper).toHaveLength(1);
});
