import React from 'react';
import PropTypes from 'prop-types';
import {
  formatPhoneForDisplay,
  getPhoneHref,
} from '../../utils/phones';

function PhoneLink({
  number,
  extension,
  type,
  description,
  className,
}) {
  const phoneLink = getPhoneHref({ number, extension, type });
  const displayPhone = formatPhoneForDisplay({
    number,
    extension,
    type,
    description,
  });

  if (!phoneLink) {
    return (
      <span className={className}>
        {displayPhone}
      </span>
    );
  }

  if (phoneLink.startsWith('https://')) {
    return (
      <a
        className={className}
        href={phoneLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        {displayPhone}
      </a>
    );
  }

  return (
    <a
      className={className}
      href={phoneLink}
    >
      {displayPhone}
    </a>
  );
}

PhoneLink.propTypes = {
  number: PropTypes.string.isRequired,
  extension: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  type: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
};

PhoneLink.defaultProps = {
  extension: null,
  type: null,
  description: null,
  className: null,
};

export default PhoneLink;
