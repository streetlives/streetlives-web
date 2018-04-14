import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

function Icon({ name, size }) {
  const classNames = cx(`fa fa-${name}`, {
    'fa-lg': size === 'lg',
    'fa-2x': size === '2x',
    'fa-3x': size === '3x',
  });

  return <i className={classNames} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.string,
};

Icon.defaultProps = {
  size: '',
};

export default Icon;
