import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServiceAgesServed() {
  return (
    <div>
      <Header>What ages are served here?</Header>
      <Input fluid placeholder="e.g. Ages 0-5, 5-10" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
