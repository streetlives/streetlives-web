import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './Header.css';

function Header({
  children, as, size, className,
}) {
  const classNames = cx('Header', className, {
    'Header-large': size === 'large',
    'Header-medium': size === 'medium',
    'Header-small': size === 'small',
  });

  const ElementType = as || 'h1';

  return <ElementType className={classNames}>{children}</ElementType>;
}

Header.propTypes = {
  children: PropTypes.string.isRequired,
  as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4']),
  size: PropTypes.string,
  className: PropTypes.string,
};

Header.defaultProps = {
  as: 'h1',
  size: '',
  className: '',
};

export default Header;
