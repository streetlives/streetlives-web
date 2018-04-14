import React from 'react';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import Header from '../../components/header';
import Button from '../../components/button';

function LocationForm() {
  return (
    <div className="text-left">
      <NavBar title="Entrance Picture" />
      <ProgressBar progress={0} />
      <div className="container">
        <div className="row px-4">
          <Header>Please take a picture of this location&apos;s main street entrance</Header>
          <Button primary className="mt-3">
            Icon
          </Button>
        </div>
      </div>
      <div className="position-absolute" style={{ right: 0, bottom: 12 }}>
        <div className="container">
          <div className="row px-4">
            <Button compact disabled>
              Up
            </Button>
            <Button compact>Dn</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationForm;
