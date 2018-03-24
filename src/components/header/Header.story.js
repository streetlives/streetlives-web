import React from "react";

import { storiesOf } from "@storybook/react";

import Header from "./Header";

const DefaultExample = (
  <div className="container-fluid">
    <Header>Default Header</Header>
    <Header size="large">Large Header</Header>
    <Header size="medium">Medium Header</Header>
    <Header size="small">Small Header</Header>
  </div>
);

storiesOf("Header", module)
  .add("Overview", () => [DefaultExample])
  .add("Default example", () => DefaultExample);
