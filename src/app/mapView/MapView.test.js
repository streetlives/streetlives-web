import React from "react";
import MapView from "./MapView";
import { shallow } from "enzyme";

it("renders without crashing", () => {
  const wrapper = shallow(<MapView />);
  expect(wrapper).toHaveLength(1);
});
