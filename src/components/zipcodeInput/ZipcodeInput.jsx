import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './ZipcodeInput.css';

const zipcodeDigits = 5;
const isValidZipcode = digits => digits.length === zipcodeDigits;

function ZipcodeInput({
  value,
  onChange,
  className,
}) {
  const classNames = cx('ZipcodeInput', className);

  return (
    <input
      type="number"
      value={value}
      max={parseInt('9'.repeat(zipcodeDigits), 10)}
      onChange={(event) => {
        const zipcode = event.target.value.slice(0, zipcodeDigits);
        onChange({ value: zipcode, isValid: isValidZipcode(zipcode) });
      }}
      className={classNames}
    />
  );
}

ZipcodeInput.propTypes = {
  className: PropTypes.string,
};

export default ZipcodeInput;
