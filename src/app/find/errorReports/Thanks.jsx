import React from 'react';
import Button from '../../components/button';
import Heart from '../../components/heart';
import withErrorReportsForm from './withErrorReportsForm';

const Thanks = (props) => {
  const { goToViewLocation } = props;

  return (
    <div>
      <div className="content text-left">
        <p>
          <Heart width="100" height="100" />
        </p>
        <p className="Header">Thank you so much!</p>
        <p>
          You&#39;re helping everyone to get more reliable information.
          And the reliable information is making it easier for people to get the help they need.
        </p>
        <p>
          Thank you.
        </p>
      </div>
      <div className="mx-4">
        <Button
          className="mx-4"
          primary
          fluid
          onClick={goToViewLocation}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default withErrorReportsForm(Thanks);
