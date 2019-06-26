import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './Modal.css';

function Modal({ children, className }) {
  const classNames = cx('Modal', 'modal', className);

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
};

Modal.defaultProps = {
  className: '',
};

export default Modal;
