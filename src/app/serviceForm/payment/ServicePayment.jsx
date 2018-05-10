import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServicePayment() {
  return (
    <div>
      <Header>Does this service cost anything or require payment?</Header>
      <Input fluid placeholder="Payment requirements...." />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
