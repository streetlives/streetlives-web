import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/button';
import Heart from '../../../components/heart';

const Thanks = (props) => {
  const { goToViewLocation } = props;

  return (
    <div>
      <div className="mx-4 mb-3 text-left">
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

Thanks.propTypes = {
  goToViewLocation: PropTypes.func.isRequired,
};

export default Thanks;
