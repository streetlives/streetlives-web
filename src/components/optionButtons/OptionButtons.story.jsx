import React from 'react';

import { storiesOf } from '@storybook/react';

import OptionButtons from './OptionButtons';

const OptionExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="optionExample">Option</label>
    <OptionButtons.Option iconName="user" id="optionExample">Just me</OptionButtons.Option>
  </div>
);

const NoIconExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="noIconExample">No-Icon Option</label>
    <OptionButtons.Option id="noIconExample">Nothing</OptionButtons.Option>
  </div>
);

const ActiveExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="activeExample">Active Option</label>
    <OptionButtons.Option iconName="user" id="activeExample" active>Just me</OptionButtons.Option>
  </div>
);

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="defaultOptionButtons">Default Option Buttons</label>
    <OptionButtons id="defaultOptionButtons">
      <OptionButtons.Option iconName="user">Just me</OptionButtons.Option>
      <OptionButtons.Option iconName="users">Me and my kids</OptionButtons.Option>
      <OptionButtons.Option iconName="child" active>Only my kids</OptionButtons.Option>
    </OptionButtons>
  </div>
);

storiesOf('OptionButtons', module)
  .add('Overview', () => [
    OptionExample,
    NoIconExample,
    ActiveExample,
    DefaultExample,
  ])
  .add('Default example', () => DefaultExample);
