import React from 'react';
import PropTypes from 'prop-types';

function PhoneLink({ number }) {
  // TODO: Handle other fields (extensions and such).
  const phoneLink = `tel:${number}`;
  return (
    <a className="locationLinks" href={phoneLink}>
      {number}
    </a>
  );
}

PhoneLink.propTypes = {
  number: PropTypes.string.isRequired,
};

export default PhoneLink;
