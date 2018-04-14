import React from 'react';

import { storiesOf } from '@storybook/react';

import Input from './Input';

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Default Input</label>
    <Input placeholder="Enter your email..." />
  </div>
);

const FluidExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Full Width Input</label>
    <Input fluid placeholder="Enter your email..." />
  </div>
);

storiesOf('Input', module)
  .add('Overview', () => [DefaultExample, FluidExample])
  .add('Default example', () => DefaultExample)
  .add('Fluid example', () => FluidExample);
