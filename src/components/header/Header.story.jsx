import React from 'react';

import { storiesOf } from '@storybook/react';

import Header from './Header';

const SizeExample = (
  <div className="container-fluid">
    <Header>Default Header</Header>
    <Header size="large">Large Header</Header>
    <Header size="medium">Medium Header</Header>
    <Header size="small">Small Header</Header>
  </div>
);

const HeadingExample = (
  <div className="container-fluid">
    <Header>Default Header</Header>
    <Header as="h1">H1 Header</Header>
    <Header as="h2">H2 Header</Header>
    <Header as="h3">H3 Header</Header>
  </div>
);

storiesOf('Header', module)
  .add('Overview', () => [SizeExample, HeadingExample])
  .add('Size example', () => SizeExample)
  .add('Heading example', () => HeadingExample);
