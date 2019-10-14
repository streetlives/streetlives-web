import React from 'react';

import { storiesOf } from '@storybook/react';

import Selector from './Selector';

const OptionExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="optionExample">Option</label>
    <Selector.Option id="optionExample">Overnight</Selector.Option>
  </div>
);

const ActiveExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="activeExample">Active</label>
    <Selector.Option id="activeExample" active>Overnight</Selector.Option>
  </div>
);

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="defaultSelector">Default Selector</label>
    <Selector id="defaultSelector">
      <Selector.Option>Overnight</Selector.Option>
      <Selector.Option>Family shelter</Selector.Option>
      <Selector.Option align="center">+ Add another service</Selector.Option>
    </Selector>
  </div>
);

const FluidExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="fluidSelector">Full width</label>
    <Selector fluid id="fluidSelector">
      <Selector.Option>Overnight</Selector.Option>
      <Selector.Option>Family shelter</Selector.Option>
      <Selector.Option align="center">+ Add another service</Selector.Option>
    </Selector>
  </div>
);

const SelectedExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="selector">Selected</label>
    <Selector fluid id="selector">
      <Selector.Option active>Overnight</Selector.Option>
      <Selector.Option active>Family shelter</Selector.Option>
      <Selector.Option align="center" active>
        + Add another service
      </Selector.Option>
    </Selector>
  </div>
);

const RowExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="rowSelector">Row (Horizontal) Selector</label>
    <Selector direction="row" id="rowSelector">
      <Selector.Option>Overnight</Selector.Option>
      <Selector.Option>Family shelter</Selector.Option>
      <Selector.Option align="center">+ Add another service</Selector.Option>
    </Selector>
  </div>
);

const FluidRowExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="fluidRowSelector">Full width row</label>
    <Selector fluid direction="row" id="fluidRowSelector">
      <Selector.Option>Overnight</Selector.Option>
      <Selector.Option>Family shelter</Selector.Option>
      <Selector.Option align="center">+ Add another service</Selector.Option>
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
    RowExample,
    FluidRowExample,
  ])
  .add('Default example', () => DefaultExample)
  .add('Full width example', () => FluidExample)
  .add('Horizontal (row direction) example', () => RowExample)
  .add('Full width horizontal example', () => FluidRowExample);
