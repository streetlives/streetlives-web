import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServiceAlternativeName() {
  return (
    <div>
      <Header>Does this service have an alternative name?</Header>
      <Input fluid placeholder="e.g. Alternative name" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
