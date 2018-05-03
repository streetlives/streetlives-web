import React from 'react';

import Input from '../../../components/input';
import Header from '../../../components/header';
import Button from '../../../components/button';

export default function ServiceDescription() {
  return (
    <div>
      <Header>How would you describe this service?</Header>
      <Input fluid placeholder="e.g. Free Breakfast & Lunch, 2 helpings" />
      <Button onClick={() => {}} primary className="mt-3">
        OK
      </Button>
    </div>
  );
}
