import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import infoImage from './info.svg';
import './Info.css';

function Icon({ onClick, className }) {
  const classNames = cx('Info', className);
  return (
    <input
      type="image"
      alt="info"
      src={infoImage}
      className={classNames}
      onClick={onClick}
    />
  );
}

Icon.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Icon.defaultProps = {
  className: '',
};

export default Icon;
