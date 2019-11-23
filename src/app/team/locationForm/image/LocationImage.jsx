import React from 'react';
import Header from 'components/header';
import Button from 'components/button';
import Icon from 'components/icon';

function LocationImage(props) {
  return (
    <div>
      <Header>Please take a picture of this location&apos;s main street entrance</Header>
      <Button onClick={() => {}} primary className="mt-3">
        <Icon name="camera" size="lg" />
      </Button>
    </div>
  );
}

export default LocationImage;
