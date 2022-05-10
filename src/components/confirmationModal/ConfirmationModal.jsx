import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../modal';
import Header from '../header';
import Button from '../button';

function ConfirmationModal({
  confirmText,
  cancelText,
  headerText,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal>
      <Header size="" className="m-4 flex-grow-1">
        { headerText }
      </Header>
      <div className="px-3">
        <Button onClick={onConfirm} primary fluid>
          { confirmText }
        </Button>
        <Button onClick={onCancel} primary basic fluid className="my-2">
          { cancelText }
        </Button>
      </div>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  headerText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
};

ConfirmationModal.defaultProps = {
  confirmText: 'YES',
  cancelText: 'NO',
  headerText: 'Are you sure?',
};

export default ConfirmationModal;
