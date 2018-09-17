import React from 'react';

import { storiesOf } from '@storybook/react';

import TextArea from './TextArea';

const DefaultExample = (
  <div className="container">
    <label className="w-100 mt-4" htmlFor="defaultTextArea">Default TextArea</label>
    <TextArea id="defaultTextArea" placeholder="Enter some long story with multiple lines..." />
  </div>
);

const FluidExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="fluidTextArea">Full Width TextArea</label>
    <TextArea id="fluidTextArea" fluid placeholder="Enter some long story with multiple lines..." />
  </div>
);

storiesOf('TextArea', module)
  .add('Overview', () => [DefaultExample, FluidExample])
  .add('Default example', () => DefaultExample)
  .add('Fluid example', () => FluidExample);
