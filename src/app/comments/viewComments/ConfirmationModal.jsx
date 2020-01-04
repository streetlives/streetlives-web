import React from 'react';
import Modal from '../../../components/modal';
import Header from '../../../components/header';
import Button from '../../../components/button';

function ConfirmationModal({
  prompt,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal>
      <Header size="large" className="m-4 flex-grow-1">
        {prompt}
      </Header>
      <div className="px-3">
        <Button onClick={onConfirm} primary fluid>
          {confirmText}
        </Button>
        <Button onClick={onCancel} primary basic fluid className="my-2">
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;
