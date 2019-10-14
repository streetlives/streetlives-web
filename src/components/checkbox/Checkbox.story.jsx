import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Checkbox from './Checkbox';

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="defaultCheckbox">Checkbox</label>
    <Checkbox name="default" id="defaultCheckbox" label="A checkbox" onChange={action('change')} />
  </div>
);

const DisabledExample = (
  <div className="container-fluid">
    <label htmlFor="disabled-example" className="w-100 mt-4">Disabled Checkbox</label>
    <Checkbox
      name="disabled"
      id="disabledCheckbox"
      label="Disabled"
      disabled
      onChange={action('change')}
    />
  </div>
);

const CheckedExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="checkedCheckbox">Checked Checkbox</label>
    <Checkbox
      name="checked"
      id="checkedCheckbox"
      checked
      label="Checked"
      onChange={action('change')}
    />
  </div>
);

storiesOf('Checkbox', module)
  .add('Overview', () => [
    DefaultExample,
    DisabledExample,
    CheckedExample,
  ])
  .add('Default example', () => DefaultExample)
  .add('when disabled', () => DisabledExample)
  .add('when checked', () => CheckedExample);
