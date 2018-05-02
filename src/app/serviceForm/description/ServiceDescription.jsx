import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServiceDescription({ onBack, onNext }) {
  return (
    <div>
      <Header>How would you describe this organization?</Header>
      <Input fluid placeholder="e.g. NYC's largest soup Kitchen and Pantry" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
