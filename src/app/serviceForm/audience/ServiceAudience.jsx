import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServiceAudience() {
  return (
    <div>
      <Header>Who does this serve?</Header>
      <Input fluid placeholder="Audience..." />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
