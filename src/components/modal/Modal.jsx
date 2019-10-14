import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './Modal.css';

function Modal({ children, className, compact }) {
  const classNames = cx('Modal', 'modal', className, {
    'Modal-compact': compact,
  });

  return (
    <div>
      <div className={classNames}>
        {children}
      </div>
      <div className="modal-backdrop show" />
    </div>
  );
}

Modal.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  className: PropTypes.string,
  compact: PropTypes.bool,
};

Modal.defaultProps = {
  className: '',
  compact: false,
};

export default Modal;
