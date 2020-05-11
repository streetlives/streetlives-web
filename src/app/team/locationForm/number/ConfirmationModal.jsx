import React from 'react';
import Modal from '../../../../components/modal';
import Header from '../../../../components/header';
import Button from '../../../../components/button';

function ConfirmationModal({
  number,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal>
      <Header size="" className="m-4 flex-grow-1">
        Are you sure that you want to delete <br />
        { number }?
      </Header>
      <div className="px-3">
        <Button onClick={onConfirm} primary fluid>
          YES
        </Button>
        <Button onClick={onCancel} primary basic fluid className="my-2">
          NO, LET’S KEEP IT
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;
