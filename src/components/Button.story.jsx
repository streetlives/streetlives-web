import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import Button from "./Button";

storiesOf("Button", module)
  .add("Overview", () => (
    <span>
      <div>
        <div>
          <label>Button</label>
        </div>
        <Button onClick={action("clicked")}>Default</Button>
      </div>

      <div>
        <div>
          <label>Types</label>
        </div>
        <Button primary onClick={action("clicked")}>
          Primary
        </Button>
        <Button secondary onClick={action("clicked")}>
          Secondary
        </Button>
      </div>

      <div>
        <div>
          <label>Fluid</label>
        </div>
        <Button fluid>Fits to Container</Button>
      </div>
    </span>
  ))
  .add("with text", () => <Button onClick={action("clicked")}>Hello Button</Button>)
  .add("with some emoji", () => (
    <Button onClick={action("clicked")}>
      <span role="img" aria-label="emoji">
        😀 😎 👍 💯
      </span>
    </Button>
  ));
