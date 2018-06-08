import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Dropdown from './Dropdown';

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="defaultDropdown">Dropdown</label>
    <Dropdown
      id="defaultDropdown"
      options={[
        { id: 'option1', label: 'Option 1', onClick: action('Option 1 clicked') },
        { id: 'option2', label: 'Option 2', onClick: action('Option 2 clicked') },
        { id: 'option3', label: 'Option 3', onClick: action('Option 3 clicked') },
      ]}
    />
  </div>
);

const EmptyExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="emptyDropdown">Empty</label>
    <Dropdown id="emptyDropdown" options={[]} />
  </div>
);

storiesOf('Dropdown', module)
  .add('Overview', () => [
    DefaultExample,
    EmptyExample,
  ])
  .add('Default example', () => DefaultExample)
  .add('with no options', () => EmptyExample);
