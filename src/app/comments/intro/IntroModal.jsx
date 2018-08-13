import React from 'react';
import IntroComponent from './IntroComponent';

const modalStyles = {
  position: 'fixed',
  top: '10px',
  left: '10px',
  right: '10px',
  bottom: '10px',
  backgroundColor: 'white',
  overflow: 'auto',
};

function IntroModal({ name, onDismiss }) {
  return (
    <div>
      <IntroComponent
        style={modalStyles}
        className="modal"
        name={name}
        footer={(
          <small>
            Certain comments may be removed at {name}’s discretion
          </small>
        )}
        buttonText="GOT IT"
        onClick={onDismiss}
      />
      <div className="modal-backdrop show" />
    </div>
  );
}

export default IntroModal;
