import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServiceEligibility() {
  return (
    <div>
      <Header>Would you like to add any other eligibility info?</Header>
      <Input fluid placeholder="e.g. Provide proof for ALL family members" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
