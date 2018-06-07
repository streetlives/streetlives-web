import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Button from './Button';

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="defaultButton">Button</label>
    <Button id="defaultButton" onClick={action('clicked')}>Default</Button>
  </div>
);

const TypesExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Types</label>
    <Button primary onClick={action('clicked')}>
      Primary
    </Button>
    <Button secondary onClick={action('clicked')}>
      Secondary
    </Button>
  </div>
);

const DisabledExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Disabled Buttons</label>
    <Button disabled onClick={action('clicked')}>
      Default
    </Button>
    <Button disabled primary onClick={action('clicked')}>
      Primary
    </Button>
    <Button disabled secondary onClick={action('clicked')}>
      Secondary
    </Button>
  </div>
);

const BasicExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4">Disabled Buttons</label>
    <Button basic onClick={action('clicked')}>
      Default
    </Button>
    <Button basic primary onClick={action('clicked')}>
      Primary
    </Button>
    <Button basic secondary onClick={action('clicked')}>
      Secondary
    </Button>
  </div>
);

const FluidExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="fluidButton">Fluid</label>
    <Button fluid id="fluidButton">Fits to Container</Button>

    <label className="w-100 mt-4" htmlFor="primaryFluidButton">Fluid</label>
    <Button fluid primary id="primaryFluidButton">
      Fits to Container
    </Button>

    <label className="w-100 mt-4" htmlFor="secondaryFluidButton">Fluid</label>
    <Button fluid secondary id="secondaryFluidButton">
      Fits to Container
    </Button>
  </div>
);

storiesOf('Button', module)
  .add('Overview', () => [
    DefaultExample,
    TypesExample,
    BasicExample,
    DisabledExample,
    FluidExample,
  ])
  .add('Default example', () => DefaultExample)
  .add('with types', () => TypesExample)
  .add('with basic types', () => BasicExample)
  .add('with disabled types', () => DisabledExample)
  .add('with fluid width', () => FluidExample);
