import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServiceOtherInfo() {
  return (
    <div>
      <Header>Would you like to add any other info about this service?</Header>
      <Input fluid placeholder="e.g. People who fight are banned for a week" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
