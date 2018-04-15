import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

function LocationDescription(props) {
  return (
    <div>
      <Header>Please describe this location</Header>
      <Input fluid placeholder="Enter a description of the location" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}

export default LocationDescription;
