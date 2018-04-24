import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

function AdditionalInfo(props) {
  return (
    <div>
      <Header>
        Are there any other details about this organization or location you would like to add?
      </Header>
      <Input fluid placeholder="e.g. They are moving to a new location in a couple of weeks" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}

export default AdditionalInfo;
