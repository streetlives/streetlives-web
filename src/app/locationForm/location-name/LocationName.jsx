import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

function LocationName(props) {
  return (
    <div>
      <Header>What&apos;s this location&apos;s name?</Header>
      <Input fluid placeholder="Enter the name of the organization" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}

export default LocationName;
