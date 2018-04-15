import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

function LocationAddress(props) {
  return (
    <div>
      <Header>What&apos;s this organization&apos;s address?</Header>
      <Input fluid placeholder="Enter address" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}

export default LocationAddress;
