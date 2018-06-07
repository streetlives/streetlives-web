import React from 'react';

import { storiesOf } from '@storybook/react';

import Accordion from './Accordion';

const DefaultExample = (
  <div className="container-fluid">
    <label className="w-100 mt-4" htmlFor="accordion">Accordion</label>
    <Accordion id="accordion">
      <Accordion.Item title="Shelter" icon="home" />
      <Accordion.Content>This is test content</Accordion.Content>

      <Accordion.Item active title="Food" icon="cutlery" />
      <Accordion.Content active>This is test content</Accordion.Content>

      <Accordion.Item title="Other Services" icon="ellipsis-h" />
      <Accordion.Content>This is test content</Accordion.Content>
    </Accordion>
  </div>
);

storiesOf('Accordion', module).add('Overview', () => [DefaultExample]);
