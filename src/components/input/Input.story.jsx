import React from 'react';

import { storiesOf } from '@storybook/react';

import Input from './Input';

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="defaultInput">Default Input</label>
    <Input id="defaultInput" placeholder="Enter your email..." />
  </div>
);

const FluidExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="fluidInput">Full Width Input</label>
    <Input id="fluidInput" fluid placeholder="Enter your email..." />
  </div>
);

storiesOf('Input', module)
  .add('Overview', () => [DefaultExample, FluidExample])
  .add('Default example', () => DefaultExample)
  .add('Fluid example', () => FluidExample);
