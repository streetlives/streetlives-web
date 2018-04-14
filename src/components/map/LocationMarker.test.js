import React from "react";
import { shallow } from "enzyme";
import LocationMarker from "./LocationMarker";

it("renders without crashing", () => {
  const wrapper = shallow(<LocationMarker />);
  expect(wrapper).toHaveLength(1);
});
