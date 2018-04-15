import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

function LocationWebsite(props) {
  return (
    <div>
      <Header>What&apos;s this organization&apos;s website?</Header>
      <Input fluid placeholder="Enter website" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}

export default LocationWebsite;
