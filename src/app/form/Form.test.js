import React from "react";
import Form from "./Form";
import { shallow } from "enzyme";

it("renders without crashing", () => {
  const wrapper = shallow(<Form />);
  expect(wrapper).toHaveLength(1);
});
