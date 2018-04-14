import React from 'react';

import { storiesOf } from '@storybook/react';

import Selector from './Selector';

const OptionExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Option</label>
    <Selector.Option>Overnight</Selector.Option>
  </div>
);

const ActiveExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Active</label>
    <Selector.Option active>Overnight</Selector.Option>
  </div>
);

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Default Selector</label>
    <Selector>
      <Selector.Option>Overnight</Selector.Option>
      <Selector.Option>Family shelter</Selector.Option>
      <Selector.Option align="center">+ Add another service</Selector.Option>
    </Selector>
  </div>
);

const FluidExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Full width</label>
    <Selector fluid>
      <Selector.Option>Overnight</Selector.Option>
      <Selector.Option>Family shelter</Selector.Option>
      <Selector.Option align="center">+ Add another service</Selector.Option>
    </Selector>
  </div>
);

const SelectedExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Selected</label>
    <Selector fluid>
      <Selector.Option active>Overnight</Selector.Option>
      <Selector.Option active>Family shelter</Selector.Option>
      <Selector.Option align="center" active>
        + Add another service
      </Selector.Option>
    </Selector>
  </div>
);

storiesOf('Selector', module)
  .add('Overview', () => [
    OptionExample,
    ActiveExample,
    DefaultExample,
    FluidExample,
    SelectedExample,
  ])
  .add('Default example', () => DefaultExample)
  .add('Full width example', () => FluidExample);
