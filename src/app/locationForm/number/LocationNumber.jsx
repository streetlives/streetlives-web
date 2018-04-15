import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

function LocationNumber(props) {
  return (
    <div>
      <Header>What&apos;s this organization&apos;s phone number?</Header>
      <Input fluid placeholder="e.g. 646-909-4591" />
      <Input fluid placeholder="Extension (if any)" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}

export default LocationNumber;
