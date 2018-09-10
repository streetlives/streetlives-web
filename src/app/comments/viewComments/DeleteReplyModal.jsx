import React from 'react';
import Icon from '../../../components/icon';
import Header from '../../../components/header';
import Button from '../../../components/button';

const modalStyles = {
  position: 'fixed',
  top: '10px',
  left: '10px',
  right: '10px',
  bottom: '10px',
  backgroundColor: 'white',
  overflow: 'auto',
};

function DeleteReplyModal({ onConfirm, onCancel }) {
  return (
    <div>
      <div
        style={modalStyles}
        className="modal d-flex flex-column"
      >
        <Icon name="exclamation-triangle" size="3x" className="mt-5" />
        <Header size="large" className="m-4 flex-grow-1">
          Are you sure you want to delete this reply?
        </Header>
        <div className="px-3">
          <Button onClick={onConfirm} primary fluid>
            YES
          </Button>
          <Button onClick={onCancel} primary basic fluid className="my-2">
            NO, LET’S KEEP IT
          </Button>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </div>
  );
}

export default DeleteReplyModal;
